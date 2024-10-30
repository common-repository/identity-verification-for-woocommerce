<?php
namespace RealID\Hooks;

use RealID\ApiClient;
use Psr\Log\LoggerInterface;
use RealID\Models\IDCheck;
use RealID\Interfaces\Views;


use Automattic\WooCommerce\Internal\DataStores\Orders\CustomOrdersTableController;
use Automattic\WooCommerce\Utilities\OrderUtil;

class Orders {
  public $views;

  public function __construct(Views $views) {
    $this->views = $views;
  }

  public function register() {
    add_action( 'woocommerce_thankyou', array($this, 'post_checkout_order_script_data'), 10, 1 ); 
    add_action( 'woocommerce_thankyou', array($this, 'post_checkout_webhook'), 10, 1 ); 

    // for hooking into when a cart is turned into a draft order (but before payment)
    // turns out the "woocommerce_new_order" fires for both store api AND classic checkouts pre-payment but draft order started
    // draft order created ( https://rudrastyh.com/woocommerce/order-lifecycle-hooks.html )
    add_action("woocommerce_new_order", [$this, 'draft_order_created'], 10, 1);

    // after payment hook options (one for classic checkout and the other for blocks)
    // 
    //   woocommerce_checkout_order_processed 
    //    * code: https://github.com/woocommerce/woocommerce/blob/f39e1d72c01ed158ffda8d7bc605420b09f4b2dc/plugins/woocommerce/includes/class-wc-checkout.php#L1289
    //   woocommerce_store_api_checkout_order_processed
    //    * code: https://github.com/woocommerce/woocommerce/blob/f39e1d72c01ed158ffda8d7bc605420b09f4b2dc/plugins/woocommerce/src/StoreApi/Routes/V1/CheckoutOrder.php#L158C15-L158C61
    //
    // These are other good candidates for listening to proper orders/new events and emitting a webhook for post-checkout new orders or pre-checkout association

    add_action( 'add_meta_boxes', [ $this, 'add_metabox' ] );

    // https://github.com/woocommerce/woocommerce/wiki/High-Performance-Order-Storage-Upgrade-Recipe-Book#detecting-whether-hpos-tables-are-being-used-in-the-store
    if ( OrderUtil::custom_orders_table_usage_is_enabled() ) {
      // HPOS usage is enabled.
      // HPOS order list compat
      add_filter( 'woocommerce_shop_order_list_table_columns', [$this, 'add_real_id_column'] );
      add_action( 'woocommerce_shop_order_list_table_custom_column', [$this, 'populate_id_check_column_hpos'], 10, 2);
    } else {
      // Traditional CPT-based orders are in use.
      add_filter( 'manage_edit-shop_order_columns', [$this, 'add_real_id_column']);
      add_action( 'manage_shop_order_posts_custom_column', [$this, 'populate_id_check_column'] );
    }

    // woocommerce_add_to_cart is the actual event that fires when an item is added to the cart
    // but we need to render this cart JS object on all pages, not just when the product is added
    add_action( 'woocommerce_after_cart', [$this, 'render_cart_contents'], 10, 1);
  }

  public function post_checkout_order_script_data($order_get_id) {
    $order_data = real_id_get_order_data( $order_get_id );

    ?>
      <script type="text/javascript">
        window.realIdOrder = JSON.parse('<?php echo json_encode($order_data); ?>');
      </script>
    <?php
  }

  public function post_checkout_webhook($order_get_id) {
    // get order data
    $order_data = real_id_get_order_data($order_get_id);

    // pre-checkout
    if(real_id_is_pre_checkout_enabled()) {
      ob_start(); ?> 
      <script>
        console.log(`Real ID ::  post-checkout check <-> order association script`);
        const checkId = window.localStorage.getItem('real-id-check-id');
        const customerId = <?php echo (isset($order_data['customer']) ?  intval($order_data['customer']['id']) : 'null'); ?>;
        const orderId = <?php echo intval($order_get_id); ?>;
        // https://wordpress.stackexchange.com/questions/273144/can-i-use-rest-api-on-plain-permalink-format
        const restPath = "<?php echo get_rest_url(); ?>";
        console.log(`Real ID :: post-checkout check <-> order association script :: found check ID ${checkId}`);
        // IF THIS ROUTE 404's
        // It is most likely because the wp instance has it's permalinks NOT set to "post", and instead they're using the defaults.
        if(checkId) {
          jQuery.post(`${restPath}real-id/v1/check/order/associate`, { checkId: checkId, orderId: orderId, customerId: customerId }, () => {console.log('sent')});
        }

      </script> 
      
      <?php echo ob_get_clean();
    } 

    // get license key
    $licenseKey = real_id_get_license_key();
    $client = new ApiClient($licenseKey, [ 'http_errors' => true ]);
    
    // POST to Real API
    $response = $client->client->post('/api/webhooks/wc/orders', array('json' => $order_data));
  }

  /**
   * Associate check <> customer and order (but order isn't paid for yet, so don't fire a orders/new webhook back to core yet)
   */
  public function draft_order_created($order_id) {
      wc_get_logger()->debug(
        'woocommerce_store_api_order_processed hook called',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          'order_id'      => $order_id,
        )
      );

    if(is_int($order_id)) {
      // order_id is in fact an int, continue
    } elseif(is_object($order_id)) { 
      $order_id = $order->id;
    } else {
      wc_get_logger()->debug(
        'woocommerce_store_api_order_processed hook called, but invalid order_id given',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          'order_id'      => $order_id,
        )
      );
    }

    // get order data
    $order_data = real_id_get_order_data($order_id);

      wc_get_logger()->debug(
        'woocommerce_store_api_order_processed hook called, arranged',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          'order_id'      => $order_id,
          'order_data'    => $order_data,
        )
      );
    // get order data
    $order_data = real_id_get_order_data($order_id);

    // get license key
    $licenseKey = real_id_get_license_key();
    $client = new ApiClient($licenseKey, [ 'http_errors' => true ]);

    /**
     * Unlike the checkout shortcode version, this hook ultimately returns an JSON API response, don't attempt to append any HTML, it breaks the response
     */

    // associate the order with the check_id stored in WC session
    // apparently you need to load the cart first
    // https://wordpress.stackexchange.com/a/426531/93429
    wc_load_cart();
    $wc_session_check_id = WC()->session->get('real_id_check_id');
    if(!empty($wc_session_check_id)) {
      $posted_data = [
          'checkId' => $wc_session_check_id,
          'orderId' => $order_id,
          'customerId' => isset($order_data['customer']) ?  intval($order_data['customer']['id']) : null
      ];

      wc_get_logger()->debug(
        'woocommerce_store_api_order_processed hook - associate check with order request',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          'order_id'      => $order_id,
          'posted_data'   => $posted_data,
          'real_id_check_id' => $wc_session_check_id,
        )
      );

        $associate_res = $client->client->post('/api/webhooks/wc/associate-check-with-order', [
          'json' => $posted_data
        ]);

        if($associate_res->isSuccessful()) {
          wc_get_logger()->debug(
            'woocommerce_store_api_order_processed hook - associate check with order response - successfull',
            array(
              'source'        => 'real_id',
              'backtrace'     => false,
              'order_id'      => $order_id,
              'posted_data'   => $posted_data,
              'real_id_check_id' => $wc_session_check_id,
              'associate_res_body' => $associate_res->getBody(),
              'associate_res_status_code' => $associate_res->getStatusCode(),
              'successful' => $associate_res->isSuccessful(),
            )
          );
        } else {
          wc_get_logger()->debug(
            'woocommerce_store_api_order_processed hook - associate check with order response - failed',
            array(
              'source'        => 'real_id',
              'backtrace'     => false,
              'order_id'      => $order_id,
              'posted_data'   => $posted_data,
              'real_id_check_id' => $wc_session_check_id,
              'associate_res' => $associate_data,
              'successful' => $associate_res->isSuccessful(),
            )
          );
        }

    } else {
     wc_get_logger()->debug(
        'woocommerce_store_api_order_processed hook - real_id_check_id missing from session',
        array(
          'source'        => 'real_id',
          'backtrace'     => true,
          'order_id'      => $order_id,
          'real_id_check_id' => $wc_session_check_id,
        )
      );
    }
  }

  /**
   * Add metabox to order details page to link back to Real ID check details
   * 
   */
  public function add_metabox() {
    $screen = wc_get_container()->get( CustomOrdersTableController::class )->custom_orders_table_usage_is_enabled()
		? wc_get_page_screen_id( 'shop-order' )
		: 'shop_order';

    add_meta_box(
        'realid_box_id',          // Unique ID
        'ID verification results', // Box title
        [ self::class, 'meta_box_html' ],   // Content callback, must be of type callable
        $screen
    );
  }

    /**
     * Display the Real ID check status meta box HTML to the user within the order details page.
     *
     * @param \WP_Post $post   Post object.
     * @TODO React everywhereeeeee
     */
    public static function meta_box_html( $post_or_order_object ) {
        // A post or an order object can be passed to this hoo
        $is_post = ( $post_or_order_object instanceof \WP_Post );

        if($is_post) {
          $check_id = $post_or_order_object->real_id_check_id;
        } else {
          $check_id = $post_or_order_object->get_meta('real_id_check_id');
        }

        if(is_string($check_id) && !empty($check_id)) {
          echo sprintf("<a class='button' href='/wp-admin/admin.php?page=real-id#/checks/%s'>View ID check results</a>", $check_id);
          return;
        }

        echo "<p>No ID check has been sent for this order.</p>";
        echo "<a class='button' href='/wp-admin/admin.php?page=real-id#/new'>Create ID Check</a>";
    }

  public function add_real_id_column($columns) {
    $column = ['real_id_check' => 'ID verification'];

    // split the columns so we can inject in the 2nd to last position
    $first = array_slice($columns, 0, count($columns) - 1, true);
    $last = array_slice($columns, -1, null);

    return $first + $column + $last;
  }

  /**
   * Populate the "ID verification" column in the WC Admin Orders page
   * 
   */
  public function populate_id_check_column_hpos($column_name, $order) {
    if($column_name == 'real_id_check') {
      $current_status = $order->get_meta('real_id_check_status');
      $check_id = $order->get_meta('real_id_check_id');

      if(!empty($current_status) && isset($current_status)) {
        $this->views->render('admin/orders/id_verification_status_badge.html', [ 
          'status' => $current_status,
          'check_id' => $check_id,
        ]);
      } else {
        echo '-';
      }
    }
  }

  /**
   * Populate the "ID verification" column in the WC Admin Orders page
   * 
   */
  public function populate_id_check_column($column_name) {
    global $the_order;

    if($column_name == 'real_id_check') {
      $current_status = $the_order->get_meta('real_id_check_status');
      $check_id = $the_order->get_meta('real_id_check_id');

      if(!empty($current_status) && isset($current_status)) {
        $this->views->render('admin/orders/id_verification_status_badge.html', [ 
          'status' => $current_status,
          'check_id' => $check_id,
        ]);
      } else {
        echo '-';
      }
    }
  }
  /**
   * Render and inject the cart contents into the frontend
   */
  public function render_cart_contents() {
    $cart = WC()->cart->get_cart();

    $line_items = array_values(array_map(function ($item) {
      return [
        'product_id' => $item['product_id'],
        'category_ids' => $item['data']->get_category_ids(),
      ];
    }, $cart));

    $category_ids = array_reduce($line_items, function($carry, $item) {
      $category_ids = $item['category_ids'];
      return array_merge($category_ids, $carry);
    }, []);

    $content = [
      'total' => (float) WC()->cart->total,
      'line_items' => $line_items,
      'category_ids' => $category_ids,
    ];
    
    ?>
      <script type="text/javascript">
        window.realIdCart = JSON.parse('<?php echo json_encode($content) ?>');
      </script>
    <?php
  }
}
