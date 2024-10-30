<?php
namespace RealID;

use RealID\ApiClient;
use RealID\Models\IDCheck;
use RealID\CheckState;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Controller;
use Psr\Log\LoggerInterface;

class Webhooks extends WP_REST_Controller { 
  /**
   * Register the Webhook API routes with Wordpress
   * 
   * @return void
   */
  public function register_routes() {
    $version = '1';
    $namespace = 'real-id/v' . $version;

    register_rest_route( $namespace, '/webhooks/metadata', array(
        'methods' => 'POST',
        'callback' => array($this, 'update_metadata'),
        'permission_callback' => array($this, 'validate_webhook'),
        'args' => [
          'check_id' => [
            'description' => esc_html__('The check ID associated with the order & customer', 'realid'),
            'required' => false,
            'type' => 'string',
            'validate_callback' => function($value, $request, $key) {
              if(empty($value)) {
                return true;
              }

              return true;
            }
          ],
          'status' => [
            'description' => esc_html__('The new ID check status to update the order & customer meta tags to', 'realid'),
            'required' => true,
            'type' => 'string',
            'validate_callback' => function ($value, $request, $key) {
              return in_array($value, IDCheck::all_check_statuses());
            }
          ],
          'wc_order_id' => [
            'description' => esc_html__('The WooCommerce order to be updated with the new ID check status', 'realid'),
            'type' => 'int',
            'validate_callback' => function($param, $request, $key) {
              return is_numeric($param);
            },
            'sanitize_callback' => 'absint'
          ],
          'wc_customer_id' => [
            'description' => esc_html__('The WooCommerce customer to be updated with the new ID check status', 'realid'),
            'type' => 'int',
            'validate_callback' => function($param, $request, $key) {
              return is_numeric($param);
            },
            'sanitize_callback' => 'absint'
          ],
          'wc_settings' => [
            'description' => esc_html__('The Shops woocommerce settings', 'realid'),
            'type' => 'object',
            'validate_callback' => function($param, $request, $key) {
              return true;
            },
          ],
        ]
      ) 
    );

    register_rest_route( $namespace, '/webhooks/order/check/associate', array(
        'methods' => 'POST',
        'callback' => array($this, 'associate_resource_with_check'),
        'permission_callback' => array($this, 'validate_webhook'),
        'args' => [
          'check_id' => [
            'description' => esc_html__('The check ID associated with the order & customer', 'realid'),
            'required' => true,
            'type' => 'string',
            'validate_callback' => function($value, $request, $key) {
              return true;
            }
          ],
          'wc_order_id' => [
            'description' => esc_html__('The WooCommerce order to be associated with the new ID check status', 'realid'),
            'type' => 'int',
            'validate_callback' => function($param, $request, $key) {
              return is_numeric($param);
            },
            'sanitize_callback' => 'absint'
          ],
          'wc_customer_id' => [
            'description' => esc_html__('The WooCommerce customer to be associated with the new ID check status', 'realid'),
            'type' => 'int',
            'validate_callback' => function($param, $request, $key) {
              return is_numeric($param);
            },
            'sanitize_callback' => 'absint'
          ],
        ]
      ) 
    );

    register_rest_route( $namespace, '/metadata', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_metadata'),
        'permission_callback' => array($this, 'validate_webhook'),
        'args' => [
          'wc_order_id' => [
            'description' => esc_html__('The WooCommerce order to be associated with the new ID check status', 'realid'),
            'type' => 'int',
            'validate_callback' => function($param, $request, $key) {
              return is_numeric($param);
            },
            'sanitize_callback' => 'absint'
          ],
          'wc_customer_id' => [
            'description' => esc_html__('The WooCommerce customer to be associated with the new ID check status', 'realid'),
            'type' => 'int',
            'validate_callback' => function($param, $request, $key) {
              return is_numeric($param);
            },
            'sanitize_callback' => 'absint'
          ],
        ]
      ) 
    );

    register_rest_route( $namespace, '/order/get', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_order'),
        'permission_callback' => array($this, 'validate_webhook'),
        'args' => [
          'wc_order_id' => [
            'description' => esc_html__('The WooCommerce order to look up', 'realid'),
            'type' => 'int',
            'validate_callback' => function($param, $request, $key) {
              return is_numeric($param);
            },
            'sanitize_callback' => 'absint'
          ],
        ]
      ) 
    );

    register_rest_route( $namespace, '/version', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_version'),
        'permission_callback' => array($this, 'validate_webhook'),
        'args' => []
      ) 
    );

    register_rest_route($namespace, '/orders', [
      'methods' => 'GET',
      'callback' => [$this, 'search_orders'],
      'permission_callback' => array($this, 'validate_webhook'),
    ]);

    register_rest_route($namespace, '/customers', [
      'methods' => 'GET',
      'callback' => [$this, 'search_customers'],
      'permission_callback' => array($this, 'validate_webhook'),
    ]);

    register_rest_route( $namespace, '/shop/public/settings/sync', array(
      'methods' => 'POST',
      'callback' => array($this, 'sync_shop_public_settings'),
      'permission_callback' => array($this, 'validate_webhook'),
      ) 
    );
  }

  /**
   * Update the given customer & order metadata to the current status
   * 
   * @NOTE there is a check state machine in place to keep errant unwanted status changing
   *        However, this can be ignored with force=true
   * @param WP_REST_REQUEST $request
   * @return WP_REST_RESPONSE
   */
  public function update_metadata(WP_REST_REQUEST $request) {
    $params = $request->get_params();

    // update woocommerce order & customer metadata & tags
    $check_id = $params['check_id'];
    $new_status = $params['status'];

  

    // attempt to set the metadata of the order
    //   1. Check that the order is present
    //   2. Make sure the new check status is qualified to change (for example: completed -> opened is not allowed) 
    if(isset($params['wc_order_id']) && !empty($params['wc_order_id'])) {
      $wc_order_id = $params['wc_order_id'];
      $order = wc_get_order($wc_order_id);

      if(!$order) {
        $response = new WP_REST_Response('Order not found.');
        $response->set_status(422);
        return $response;
      }

      // If shop settings are available AND order status syncing enabled
      // Then update the order status
      // make sure not to update orders that are "Payment processing", or "Failed" - these are statuses controled by payment gateways:
      // https://woocommerce.com/document/managing-orders/#visual-diagram-to-illustrate-order-statuses
      // also more details on slugs
      // https://github.com/woocommerce/woocommerce/blob/master/includes/wc-order-functions.php#L86-L104
      try {
        $current_status = $order->get_meta('real_id_check_status');
        $current_status = empty($current_status) ? 'delivered' : $current_status;
        $current_order_status = $order->get_status();


        if(
          in_array($current_order_status, ['wc_processing', 'processing', 'wc-processing', 'completed', 'wc_completed', 'wc-completed', 'on_hold', 'on-hold', 'wc_on_hold', 'wc-on-hold']) &&
          !empty($params['wc_shop_settings']) &&
          isset($params['wc_shop_settings']['orderStatusSyncingEnabled']) &&
          !!$params['wc_shop_settings']['orderStatusSyncingEnabled']) 
        {
          wc_get_logger()->debug(
            'webhook - update_metadata - syncing order status',
            array(
              'source'        => 'real_id',
              'backtrace'     => false,
              'check_id' => $check_id,
              'wc_order_id' => $wc_order_id,
              'params'   => $params,
              'current_order_status' => $current_order_status,
              'current_real_id_check_status' => $current_status,
              'new_real_id_check_status' => $new,
            )
          );
          switch($new_status) {
            case 'delivered':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['in_progress'], sprintf("Real ID check %s in progress", $check_id));
              break;
            case 'opened':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['in_progress'], sprintf("Real ID check %s in progress", $check_id));
              break;
            case 'id':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['in_progress'], sprintf("Real ID check %s in progress", $check_id));
              break;
            case 'face_match':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['in_progress'], sprintf("Real ID check %s in progress", $check_id));
              break;
            case 'in_review':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['failed'], sprintf("Real ID check %s in review", $check_id));
              break;
            case 'failed':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['failed'], sprintf("Real ID check %s failed", $check_id));
              break;
            case 'manually_rejected':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['failed'], sprintf("Real ID check %s manually rejected", $check_id));
              break;
            case 'completed':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['completed'], sprintf("Real ID check %s verified", $check_id));
              break;
            case 'manually_approved':
              $order->update_status($params['wc_shop_settings']['orderStatusMapping']['completed'], sprintf("Real ID check %s manually approved", $check_id));
              break;
            default:
              // by default don't update the order status if the new check status is not recognized
          }
        }
      } catch(\Exception $e) {

      }

      // if($current_status == $new_status) {
      //   $response = new WP_REST_Response([
      //     'message' => 'Same status, nothing to do here.',
      //     'current_status' => $current_status,
      //     'new_order_status' => $new_status,
      //     'current_order_status' => $current_order_status,
      //     'order_status' => $order->get_status(),
      //     'wc_shop_settings' => $params['wc_shop_settings'],
      //     'updated_wc_order_status' => in_array($current_order_status, ['wc_processing', 'processing', 'completed', 'wc_completed']) && !empty($params['wc_shop_settings']) && $params['wc_shop_settings']['orderStatusSyncingEnabled']
      //   ]);
      //   $response->set_status(200);

      //   return $response;
      // }

      // if there's not status yet, it's safe to make one
      $checkState = new CheckState($current_status);

      // let's make sure the new state is allowed before we update the order & customer metadata
      $isAvailableTransition = isset($params['force']) && $params['force'] == 'true' ? true :  $checkState->stateMachine->getCurrentState()->can($new_status);

      if(!$isAvailableTransition) {
        // let the API know that this status change isn't possible.
        $response = new WP_REST_Response([
          'message' => 'Not a valid status transition',
          'current_status' => $current_status,
          'new_status' => $new_status,
          'order_status' => $order->get_status(),
        ]);
        $response->set_status(422);

        return $response;
      }

      $order->update_meta_data('real_id_check_status', $new_status);
      $order->save();
    }

    if(isset($params['wc_customer_id'])) {
      $wc_customer_id = $params['wc_customer_id'];
      // attempt to set the metadata of the customer
      update_user_meta($wc_customer_id, 'real_id_check_status', $new_status);
    }

    $response = new WP_REST_Response([
      'message' => 'Saved status update', 
      'new_check_status' => $new_status, 
      // 'prior_check_status' => $current_status, 
      // the order may not exist, we can't do this here
      // 'new_order_status' => $order->get_status(),
      // 'prior_order_status' => $current_order_status,
    ]);
    $response->set_status(200);
    return $response;
  }

  /**
   * For remote troubleshooting to make sure metadata is accurate 
   */
  public function get_metadata(WP_REST_Request $request) {
    $params = $request->get_params();
    $data = [];

    if(isset($params['wc_customer_email'])) {
      $customer_by_email = get_user_by('email', $params['wc_customer_email']);

      if(!$customer_by_email) {
        $response = new WP_REST_Response([
          'message' => 'customer by that email not found',
          'email' => $params['wc_customer_email'],
        ]);
        $response->set_status(404);

        return $response; 
      }

      $data['wc_customer_email'] = $params['wc_customer_email'];
      $data['wc_customer_id'] = $customer_by_email->ID;
      $data['wc_customer_status'] = get_user_meta($customer_by_email->ID, 'real_id_check_status', true);
      $data['wc_customer_check_id'] = get_user_meta($customer_by_email->ID, 'real_id_check_id', true);
    }

    if(isset($params['wc_customer_id'])) {
      $data['wc_customer_check_id'] = get_user_meta($params['wc_customer_id'], 'real_id_check_id', true);
      $data['wc_customer_status'] = get_user_meta($params['wc_customer_id'], 'real_id_check_status', true);
    }

    if(isset($params['wc_order_id'])) {
      $order = wc_get_order( $params['wc_order_id'] );

      $data['wc_order_status'] = $order->get_meta('real_id_check_status');
      $data['wc_order_check_id'] = $order->get_meta('real_id_check_id');
    }

    $response = new WP_REST_Response($data);
    $response->set_status(200);

    return $response;
  }

  /**
   * Associate the given order or customer with the given check ID
   * 
   * This will set the order and/or customer's real_id_check_id meta tag
   */
  public function associate_resource_with_check(WP_REST_REQUEST $request) {
    $response = new WP_REST_Response();
    $params = $request->get_params();
    // by default the endpoint is not able to update the customer or order meta without valid params
    $updated_order_meta = false;
    $updated_customer_meta = false;

    // update woocommerce order & customer metadata & tags
    $wc_order_id = $params['wc_order_id'];
    $wc_customer_id = isset($params['wc_customer_id']) ? $params['wc_customer_id'] : null;
    $check_id = $params['check_id'];

    if((!$wc_order_id || !$wc_customer_id) && !$check_id) {
      // we need both the check ID and a taggable resource like a customer or order to perform the association
      $response->set_data([ 'message' => 'Requires a wc_customer_id or wc_order_id and a check_id' ]);
      $response->set_status(422);
      return $response;
    }

    if(isset($wc_order_id) && !empty($wc_order_id)) {
      // attempt to set the metadata of the order
      $order = wc_get_order($wc_order_id);
      if(!$order) {
        $response->set_status(422);
        $response->set_data([ 'message' => 'Order not found.' ]);
        return $response;
      }
      $order->update_meta_data( 'real_id_check_id', $check_id );
      $order->save();
    }

    if(isset($wc_customer_id) && !empty($wc_customer_id)) {
      // attempt to set the metadata of the customer
      $updated_customer_meta = update_user_meta($wc_customer_id, 'real_id_check_id', $check_id);
    }

    $response->set_status(200);
    $response->set_data([
      'message' => sprintf('Associated check %s. Note, a false does not necessarily mean the update failed or resource key is incorrect. It only returns true when an actual update was needed: https://developer.wordpress.org/reference/functions/update_post_meta/', $params['check_id']),
      'associated_order_successfully' => $order,
      'associated_customer_successfully' => $updated_customer_meta,
    ]);
    return $response;
  }

  /**
   * Validate the webhook's authenticity by confirming it is using a valid license key
   */
  public function validate_webhook(WP_REST_Request $request) {
    $bearer = $request->get_header('Authorization');

    // find the "authorization" header just in case
    if(empty($bearer)) {
      $bearer = $request->get_header('authorization');
    }

    // a final back up to make sure headers are coming through
    if(empty($bearer)) {
      $bearer = $request->get_header('x-real-id-api-key');
    }

    if(empty($bearer)) {
      wc_get_logger()->debug(
          'Real ID webhook request missing header',
          array(
              'source'        => 'real_id',
              'backtrace'     => false,
              'bearer_header' => $bearer,
          )
      );
      return false;
    }

    $token_parts = explode('Bearer ', $bearer);
    if(count($token_parts) != 2) {
      wc_get_logger()->debug(
          'Real ID webhook request missing token',
          array(
              'source'        => 'real_id',
              'backtrace'     => false,
              'bearer_header' => $bearer,
          )
      );

      return false;
    }

    $token = $token_parts[1];
    $licenseKey = real_id_get_license_key();

    if($token !== $licenseKey) {
      wc_get_logger()->debug(
          'Real ID webhook request failed authentication',
          array(
              'source'        => 'real_id',
              'backtrace'     => false,
              'request_headers'       => $request->get_headers(),
              'token_present' => empty($token),
              'license_key_present' => empty($licenseKey),
              'last_4_token' => (!empty($token)) ? substr($token, -4) : null,
              'last_4_license_key' => (!empty($token)) ? substr($token, -4) : null,
          )
      );
    }

    return $token == $licenseKey;
  }

  /**
   * For remote order querying
   * 
   * @NOTE this is necessary for the pre-checkout IDv additional rules to work properly
   * Otherwise, we don't know the order metadata like order billing address, name, etc.
   */
  public function get_order(WP_REST_Request $request) {
    $params = $request->get_params();
    $data = [];

    if(empty($params['wc_order_id'])) {
        $response = new WP_REST_Response([
          'message' => 'wc_order_id required'
        ]);
        $response->set_status(422);

        return $response; 
    }

    $order = wc_get_order($params['wc_order_id']);
    if(!$order) {
        $response = new WP_REST_Response([
          'message' => sprintf("No order found for ID %s", $params['wc_order_id']),
        ]);
        $response->set_status(422);

        return $response; 
    }

    $order_data = real_id_get_order_data($params['wc_order_id']);

    $response = new WP_REST_Response($order_data);
    $response->set_status(200);

    return $response;
  }

  public function get_version() {
    $response = new WP_REST_Response([ 
      'real_id_version' => REAL_ID_VERSION,
      'wc_version' => WC_VERSION,
      'wp_version' => get_bloginfo('version'),
    ]);
    $response->set_status(200);

    return $response;
  }

  public function search_orders(WP_REST_Request $request) {
    $params = $request->get_params();

    // https://github.com/woocommerce/woocommerce/wiki/wc_get_orders-and-WC_Order_Query
    $orders = wc_get_orders(array_merge($params, ['paginate' => true ]));
    $ordersData = array_map(function($order) {
        return $order->get_data();
      }, $orders->orders);
    // convert to an array
    // TODO add pagination support
    $payload = [
      'total' => $orders->total,
      'max_num_pages' => $orders->max_num_pages,
      'orders' => $ordersData,
    ];

    $response = new WP_REST_Response($payload);
    $response->set_status(200);

    return $response; 
  }

  public function sync_shop_public_settings(WP_REST_Request $request) {
    $params = $request->get_params();
    $shopSettings = $request['shopSettings'];

    real_id_set_shop_public_settings($shopSettings);

    $response = new WP_REST_Response([ 'message' => 'Updated public shop settings cache', 'shopSettings' => $shopSettings ]);
    $response->set_status(200);

    return $response; 
  }

  public function search_customers(WP_REST_Request $request) {
    $params = $request->get_params();

    // https://developer.wordpress.org/reference/classes/wp_user_query
    $customers_query = new \WP_User_Query(array_merge($params, ['paged' => $params['page'] || 1, 'number' => 5 ]));
    $customers = $customers_query->get_results();

    $customersData = array_map(function($customer) {
        return [
          'email' => $customer->data->user_email, 
          'id' => $customer->data->ID,
          'roles' => $customer->roles,
        ];
      }, $customers);

    $total_user = $customers_query->total_users;  
    $total_pages=ceil($total_user/5);

    // convert to an array
    // TODO add pagination support
    $payload = [
      'total' => $total_user,
      'max_num_pages' => $total_pages,
      'customers' => $customersData,
    ];

    $response = new WP_REST_Response($payload);
    $response->set_status(200);

    return $response; 
  }
}
