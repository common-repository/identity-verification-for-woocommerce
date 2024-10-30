<?php
/**
 * Plugin Name: Identity Verification for WooCommerce
 * Plugin URI: https://getverdict.com/real-id
 * Description: Verify your customers' real identities – instantly and securely.
 * Author: verdictapps
 * Author URI: https://getverdict.com/
 * Version: 1.16.1
 * Developer: Verdict Apps
 * Developer URI: https://getverdict.com/
 * Text Domain: woocommerce-extension
 * Domain Path: /languages
 * Tested up to: 6.6.2
 *
 * Woo: 12345:342928dfsfhsf8429842374wdf4234sfd
 * WC requires at least: 3.0
 * WC tested up to: 9.3.3
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace RealID;

use RealID\Api;
use RealID\Webhooks;
use RealID\WcRealID;
use RealID\ApiClient;

if ( ! class_exists( 'WC_Integration_Real_ID' ) ) :

require(plugin_dir_path(__FILE__) . '/vendor/autoload.php');

define("REAL_ID_VERSION", "1.12.0");

class WC_Integration_Real_ID {

	/**
	* Construct the plugin.
	*/
	public function __construct() {
    add_action( 'before_woocommerce_init', function() {
      if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
      }
    } );

		add_action('plugins_loaded', array( $this, 'init' ) );
    add_filter('plugin_action_links', array($this, 'plugin_action_links'), 10, 2);
    add_action('admin_enqueue_scripts', [$this, 'register_admin_bundle_js']);
    add_action('wp_enqueue_scripts', [$this, 'register_shop_scripts']);
    add_action('wp_enqueue_scripts', [$this, 'register_idv_flow_scripts']);

    add_action('admin_notices', [$this, 'maybe_add_admin_notice']);

    add_action('rest_api_init', array( $this, 'register_api_routes' ));
    add_action('init', [$this, 'rewrite_admin_url_rules']);
    add_filter('script_loader_tag', [$this, 'add_script_module_type_attribute'] , 10, 3);
    add_shortcode('real_id_user_verification_status', [$this, 'real_id_user_verification_status_shortcode']);
    add_shortcode('real_id_current_user_verification_status', [$this, 'real_id_current_user_verification_status_shortcode']);
    add_shortcode('real_id_check', [$this, 'real_id_check_shortcode']);

    add_filter( 'manage_users_columns', [$this,'add_real_id_users_column']);
    add_filter( 'manage_users_custom_column', [$this, 'populate_real_id_users_column'], 10, 3 );
    add_filter('allowed_http_origins', [$this, 'allow_real_id_origins']);
    add_filter('robots_txt', [$this, 'robots_txt_rules'], 99, 2);
    
    if (getenv('GITPOD_WORKSPACE_URL')) {
      define('REAL_ID_API_HOST', getenv('GITPOD_WORKSPACE_URL'));
      define('REAL_ID_DEV', true);
    }

    // register filters to disable sitegroundoptimizer JS bundling
    add_filter('sgo_javascript_combine_exclude', [$this, 'exclude_scripts_from_speed_optimizer']);
    add_filter('sgo_javascript_combine_excluded_external_paths', [$this, 'exclude_script_hosts_from_speed_optimizer'] );
    add_filter('sgo_js_async_exclude', [$this, 'exclude_script_async_from_speed_optimizer'] );
	}

  function rewrite_admin_url_rules() {
    add_rewrite_rule('^real-id/(.+)?', 'index.php?pagename=/wp-admin/admin', 'top');
  }

  public function register_api_routes() {
    $api = real_id_app()->get(Api::class);
    $api->register_routes();
    $webhooks = real_id_app()->get(Webhooks::class);
    $webhooks->register_routes();
  }

  /**
   * Set up the current shop with a test key if none stored
   */
  public function setup_sandbox_key() {
    $sandboxLicenseKey = get_option('real_id_sandbox_license_key');
    $licenseKey = get_option('real_id_license_key');

    if(empty($sandboxLicenseKey) && empty($licenseKey)) {
      $client = new ApiClient();

      $res = $client->client->post('/api/shop/wc/install', [ 'json' => [
        'url' => home_url(),
      ]]);

      $data = json_decode((string) $res->getBody());

      if($res->isSuccessful()) {
        update_option('real_id_sandbox_license_key', $data->shop->licenseKey);
        // if the sandbox mode doesn't exist enable add it
        // also make sure the shop isn't already in live mode with good license key
        if(!get_site_option('real_id_sandbox_mode') && !get_site_option('real_id_license_key')) {
          update_option('real_id_sandbox_mode', true);
        }
      }
    }
  }

  public function maybe_add_admin_notice() {
    $is_localhost = $this->is_localhost();
    if ($is_localhost) {
      ?>
      <div class="notice notice-error is-dismissible">
          <p>Real ID for Woocommerce does not support development using localhost. Please make sure your development environment can be reached via a public facing URL.</p>
      </div>
      <?php
    }
  }

	/**
	* Initialize the plugin.
	*/
	public function init() {    
    if ($this->is_localhost()) return;

    // create a local sandbox key if none stored locally
    $this->setup_sandbox_key();

		// Checks if WooCommerce is installed.
		if ( class_exists( 'WC_Integration' ) ) {
      // including the class once by file instead of autoloader,
      // this way PHP has context of the file OUTSIDE of our namespaced plugin execution
      // this is necessary for the upstream WooCommerce plugin to find our integration file
      include_once(plugin_dir_path(__FILE__) . 'includes/WCRealID.php');
			// Register the integration.
			add_filter( 'woocommerce_integrations', array( $this, 'add_integration' ) );
		}
	}

  public function plugin_action_links($links, $file) {
    if (plugin_basename(__FILE__) !== $file) {
      return $links;
    }

    $settings_link = '<a href="admin.php?page=real-id">Settings</a>';

    array_unshift($links, $settings_link);

    return $links;
  }

	/**
	 * Add a new integration to WooCommerce.
	 */
	public function add_integration( $integrations ) {
    $integrations[] = WCRealID::class;
		return $integrations;
	}

  /**
   * Register the admin React javascript bundle with wordpress so we can find the development server
   */
  public function register_admin_bundle_js($hook) {
    if (defined('REAL_ID_DEV') && defined('REAL_ID_ADMIN_JS_HOST') ) {
      // DEV React dynamic loading
      $js_to_load = sprintf('%s/bundle.js', REAL_ID_ADMIN_JS_HOST);
    } else {
      $js_to_load = plugin_dir_url( __FILE__ ) . 'dist/bundle.js';
      $css_to_load = plugin_dir_url( __FILE__ ) . 'dist/styles.css';
      wp_enqueue_style('real_id_css', $css_to_load);
    }

    // Only add the React admin bundle if you're on the real-id backend page
    // This is because Shopify Polaris CSS import pollutes the CSS globally
    if(array_key_exists('page', $_GET) && $_GET['page'] === 'real-id') {
      wp_enqueue_script('real_id_js', $js_to_load, '', mt_rand(10,1000), true);

      // share the nonce with the frontend which is required for authenticating JS requests
      wp_add_inline_script(
        'real_id_js',
        'var realIdApiSettings = ' .
          json_encode(array(
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest')
          )),
        'before'
      );

      $asset_url = plugin_dir_url(__FILE__) . 'public/assets';

      // share the plugin url with the frontend too
      wp_add_inline_script(
        'real_id_js',
        sprintf('var realIdAssetsUrl = "%s"',  $asset_url),
        'before'
      );
    }
  }

  public function register_shop_scripts($hook) {
    if (!class_exists( 'WooCommerce' )) return;

    $cart = \WC()->cart->get_cart();

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
      'total' => (float) \WC()->cart->total,
      'line_items' => $line_items,
      'category_ids' => $category_ids,
    ];
    // share the current logged in customer is any with the frontend
    // pre-checkout
    // if(real_id_is_pre_checkout_enabled()) {
      ob_start(); ?> 
      <script>
        console.log(`Real ID :: current logged in customer script`);
        window.realIdCurrentUser = JSON.parse('<?php echo (real_id_get_current_user_data() ? json_encode(real_id_get_current_user_data()) : '{}'); ?>');
        window.realIdCustomerId = <?php echo (get_current_user_id() ?  get_current_user_id() : 'null'); ?>;
        window.realIdShopName = "<?php echo esc_url(real_id_get_shop_name()) ?>";
        window.realIdShopWpRestUrl = "<?php echo get_rest_url() ?>";
        window.realIdCart = JSON.parse('<?php echo json_encode($content) ?>');
        window.realIdWpNonce = "<?php echo wp_create_nonce('wp_rest') ?>";
      </script> 
      
      <?php echo ob_get_clean();
    // } 
  }

  /**
   * Register the location of the real-id flow frontend script
   */
  public function register_idv_flow_scripts($hook) {
    $delivery_methods = get_option('real_id_delivery_methods');

    // If there is no special delivery methods set yet, then don't register the frontend script on the page
    // if(!$delivery_methods || is_null($delivery_methods) || !in_array('preCheckout', $delivery_methods)) {
    //   return;
    // }

    if (defined('REAL_ID_FLOW_JS_HOST')) {
      // TODO: figure out webpack hot reloading websocket
      $js_to_load = sprintf('%s/bundle.js', REAL_ID_FLOW_JS_HOST);
    } else if(defined('REAL_ID_FLOW_JS_URL')) {
      $js_to_load = REAL_ID_FLOW_JS_URL;
    } else {
      $js_to_load = 'https://real-id-flow.getverdict.com/assets/index.js';
      // $css_to_load = 'https://real-id-flow.getverdict.com/assets/index.css';
      // wp_enqueue_style('real_id_flow_css', $css_to_load);
    }

    wp_enqueue_script('real_id_flow_js', $js_to_load, '', mt_rand(10,1000), true);
  }

  /**
   * Exclude Real ID JS scripts from SpeedOptimizers JS bundling
   * 
   * Otherwise, there's a caching issue: https://github.com/ctrlaltdylan/real-id-monorepo/issues/543
   */
  public function exclude_scripts_from_speed_optimizer($exclude_list) {
    $exclude_list[] = 'real_id_flow_js';
    // Note: not including real_id_js or real_id_shop_js because these are hosted locally within the plugin and shouldn't be affected by this bug.

    return $exclude_list;
  }

  /**
   * Exclude the Real ID JS host from SpeedOptimizers JS bundling
   * 
   * https://www.siteground.com/tutorials/wordpress/speed-optimizer/custom-filters/#Plugin_Compatibility
   */
  public function exclude_script_hosts_from_speed_optimizer($exclude_list) {
    $exclude_list[] = 'getverdict.com';
    $exclude_list[] = 'real-id-flow.getverdict.com';
    $exclude_list[] = 'idv.link';

    return $exclude_list;
  }
  /**
   * Exclude the Real ID JS from being added async by SpeedOptimizers JS bundling
   * 
   * https://www.siteground.com/tutorials/wordpress/speed-optimizer/custom-filters/#Plugin_Compatibility
   */
  public function exclude_script_async_from_speed_optimizer() {
    $exclude_list[] = 'real_id_flow_js';

    return $exclude_list;
  }

  /**
   * Real ID Flow is exported as a module script
   *    Altering the script tag for this specific tag so we can load it appropriately
   * 
   */
  public function add_script_module_type_attribute($tag, $handle, $src) {
      // if not your script, do nothing and return original $tag
      if ( 'real_id_flow_js' !== $handle ) {
          return $tag;
      }
      // change the script tag by adding type="module" and return it.
      $tag = '<script type="module" defer="defer" src="' . esc_url( $src ) . '"></script>';
      return $tag;
  }
  /**
   * Real ID shortcode for user verification status
   */
  public function real_id_user_verification_status_shortcode($atts = [], $content = null) {
    $user_id = $atts['user_id'];
    $status = get_user_meta($user_id, 'real_id_check_status', true);

    if($status == 'completed') {
      return '<span class="real-id-verified"><span class="dashicons dashicons-yes-alt"></span>&nbsp;Verified</span>';
    } else {
      return '<span class="real-id-unverified"><span class="dashicons dashicons-dismiss"></span>&nbsp;Unverified</span>';
    }

    return $content;
  }

  /**
   * Real ID shortcode for user verification status
   */
  public function real_id_current_user_verification_status_shortcode($atts = [], $content = null) {
    $user_id = get_current_user_id();
    $status = get_user_meta($user_id, 'real_id_check_status', true);

    if($status == 'completed') {
      return '<span class="real-id-verified"><span class="dashicons dashicons-yes-alt"></span>&nbsp;Verified</span>';
    } else {
      return '<span class="real-id-unverified"><span class="dashicons dashicons-dismiss"></span>&nbsp;Unverified</span>';
    }

    return $content;
  }

  /**
   * Real ID shortcode for displaying an ID check
   */
  public function real_id_check_shortcode($atts = [], $content = null) {
    // register the script to initalize the ID check wizard immediately via the JS SDK.
    wp_enqueue_script('real_id_check_shortcode_js', plugin_dir_url( __FILE__ ) .'/js/shortcode.js', ['real_id_flow_js'], mt_rand(10, 10000), [ "strategy" => "defer", "in_footer" => true ]);
    
    // render the corresponding DOM element needed to mount to.
    return '<div id="real-id-check"></div>';
    
    return $content;
  }

    function add_real_id_users_column( $columns ) {
        $columns['id_verification'] = 'ID verification';

        return $columns;
    }
    function populate_real_id_users_column( $content, $column, $user_id ) {

        if ( 'id_verification' === $column ) {
          return get_user_meta($user_id, 'real_id_check_status', true);
        }
        
        return $content;
    }

    /**
     * Add CORS support for idv.link (aka Real ID flow)
     */
    function allow_real_id_origins($domains) {
      $domains[] = 'https://real-id-flow.getverdict.com';
      $domains[] = 'https://idv.link';

      return $domains;
    }

    function is_localhost() {
      $is_localhost = in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', '::1')) ? true : false;
      return $is_localhost;
    }

    /**
     * Remove the plugin from Google Crawler
     */
    function robots_txt_rules($output, $public) {
      $output .= "Disallow: /wp-content/plugins/identity-verification-for-woocommerce/";

      return $output;
    }

}


$WC_Integration_Real_ID = new WC_Integration_Real_ID( __FILE__ );

endif;
