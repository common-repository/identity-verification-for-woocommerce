<?php
namespace RealID;

use RealID\ApiClient;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Controller;
use Psr\Log\LoggerInterface;

class Api extends WP_REST_Controller { 

  public function register_routes() {
    $version = '1';
    $namespace = 'real-id/v' . $version;

    register_rest_route( $namespace, '/license/activate', array(
        'methods' => 'POST',
        'callback' => array($this, 'activate_license_key'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        },
        'args' => [
          'licenseKey' => [
            'type' => 'string',
            'required' => true,
            'validate_callback' => function($param, $request) {
              return isset($param) && is_string($param);
            },
          ]
        ]
      ) 
    );

    register_rest_route( $namespace, '/license/deactivate', array(
        'methods' => 'DELETE',
        'callback' => array($this, 'deactivate_license_key'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/shop', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_shop'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/shop/settings', array(
        'methods' => 'POST',
        'callback' => array($this, 'update_settings'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/shop/public/settings', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_shop_public_settings'),
        'permission_callback' => function () {
          return true;
        }
      ) 
    );


    register_rest_route( $namespace, '/public/session', array(
        'methods' => 'POST',
        'callback' => array($this, 'set_wc_session'),
        'permission_callback' => function () {
          return true;
        }
      ) 
    );


    register_rest_route( $namespace, '/shop/update-delivery-methods', array(
        'methods' => 'POST',
        'callback' => array($this, 'update_delivery_methods'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/checks', array(
        'methods' => 'POST',
        'callback' => array($this, 'create_check'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/checks/create/from-pre-checkout', array(
        'methods' => 'POST',
        'callback' => array($this, 'create_check_from_pre_checkout'),
        'permission_callback' => function () {
          return true;
        }
      ) 
    );

    register_rest_route( $namespace, '/checks', array(
        'methods' => 'GET',
        'callback' => array($this, 'list_checks'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/checks/(?P<id>[a-zA-Z0-9-_]+)', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_check'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/checks/(?P<id>[a-zA-Z0-9-_]+)/reminder', array(
        'methods' => 'POST',
        'callback' => array($this, 'deliver_check_reminder'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/checks/(?P<id>[a-zA-Z0-9-_]+)/approve', array(
        'methods' => 'POST',
        'callback' => array($this, 'manually_approve_check'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/checks/(?P<id>[a-zA-Z0-9-_]+)/reject', array(
        'methods' => 'POST',
        'callback' => array($this, 'manually_reject_check'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/checks/(?P<id>[a-zA-Z0-9-_]+)/data', array(
        'methods' => 'POST',
        'callback' => array($this, 'delete_check'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    // called from the frontend script created in the "thank you" confirmation page within the plugin
    register_rest_route( $namespace, '/check/order/associate', array(
        'methods' => 'POST',
        'callback' => array($this, 'associate_check_with_order'),
        'permission_callback' => '__return_true'
      ) 
    );

    register_rest_route( $namespace, '/shop/email-signature/add', array(
        'methods' => 'POST',
        'callback' => array($this, 'add_email_sender_signature'),

        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        },
        'args' => [
          'fromName' => [
            'type' => 'string',
            'required' => true,
            'validate_callback' => function($param, $request) {
              return isset($param) && is_string($param);
            },
          ],
          'fromEmail' => [
            'type' => 'string',
            'required' => true,
            'validate_callback' => function($param, $request) {
              return isset($param) && is_string($param);
            },
          ]
        ]
      ) 
    );

    register_rest_route( $namespace, '/shop/email-signature/check-verification-status', array(
        'methods' => 'POST',
        'callback' => array($this, 'check_email_sender_signature_verification_status'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/shop/email-signature/check-dkim-status', array(
        'methods' => 'POST',
        'callback' => array($this, 'check_email_sender_dkim_status'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/shop/email-signature/check-return-path-status', array(
        'methods' => 'POST',
        'callback' => array($this, 'check_email_sender_return_path_status'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/shop/email-signature/remove', array(
        'methods' => 'DELETE',
        'callback' => array($this, 'remove_email_sender_signature'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/shop/reset', array(
        'methods' => 'POST',
        'callback' => array($this, 'reset_to_sandbox_mode'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route( $namespace, '/license-key', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_current_license_key'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route($namespace, '/orders/search', [
      'methods' => 'GET',
      'callback' => [$this, 'search_orders'],
      'permission_callback' => function () {
        return current_user_can( 'manage_options' );
      }
    ]);

    register_rest_route( $namespace, '/orders/(?P<id>[0-9]+)', array(
        'methods' => 'GET',
        'callback' => array($this, 'get_order'),
        'permission_callback' => function () {
          return current_user_can( 'manage_options' );
        }
      ) 
    );

    register_rest_route($namespace, '/customers/search', [
      'methods' => 'GET',
      'callback' => [$this, 'search_customers'],
      'permission_callback' => function () {
        return current_user_can( 'manage_options' );
      }
    ]);
  }

  /**
   * Return the license key depending on if the shop is in test or live mode
   * 
   * @return string
   */
  public function get_license_key() {
    $licenseKey = get_option('real_id_license_key');
    if($licenseKey) {
      return $licenseKey;
    }

    $sandboxLicenseKey = get_option('real_id_sandbox_license_key');
    return $sandboxLicenseKey;
  }

  /**
   * Retrieve the RVshare API client
   * 
   * @param $authenticated Boolean 
   * @return ApiClient
   */
  public function api($authenticated = true) {
    if(!$authenticated) {
      return new ApiClient();
    }

    return new ApiClient($this->get_license_key());
  }

  public function get_shop(WP_REST_Request $request) {
    // get shop settings
    $client = $this->api();

    $res = $client->client->get('/api/shop');
    $data = json_decode((string) $res->getBody(), true);

    if(function_exists('wc_get_order_statuses')) {
      $available_order_statuses = wc_get_order_statuses();
      $data['wc_available_order_statuses'] = $available_order_statuses;
    }

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    if($res->getStatusCode() === 401) {
      $response->set_data($client->getOptions());
    }

    return $response;
  }

  public function create_check(WP_REST_Request $request) {
    // create a new ID check
    $client = $this->api();
    $body = $request->get_params();

    // the API needs to know this an WC check, not a Shopify check.
    $body = array_merge($body, [ 'platform' => 'wc' ]);

    $res = $client->client->post('/api/checks/create', array( 'json' => $body ));
    $data = json_decode((string) $res->getBody());
    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response;
  }

  /**
   * Unfortunately can't use this yet because it means that Flow would need to be WP version aware enough to switch between the core API and the wp API
   * Sounds like a headache, so don't introduce WP routes because older versions will break
   */
  public function create_check_from_pre_checkout(WP_REST_Request $request) {
    // create a new ID check
    $client = $this->api();
    $body = $request->get_params();

      wc_get_logger()->debug(
        'Pre-checkout create endpoint called',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          "hook" => "create_check_from_pre_checkout",
          'params' => $body,
        )
      );

    // the API needs to know this an WC check, not a Shopify check.
    $body = array_merge($body, [ 'platform' => 'wc' ]);

    $res = $client->client->post('/api/checks/create/from-pre-checkout', array( 'json' => $body ));
    $data = json_decode((string) $res->getBody());

    if($data['check']) {
      wc()->session->set('real_id_check_id', $data['check']['id']);
      wc_get_logger()->debug(
        'Set real_id_check_id session key',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          'real_id_check_id' => $check_id,
          "hook" => "create_check_from_pre_checkout"
        )
      );
    }

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response;
  }

  public function get_check($data) {
    // get the ID check
    $client = $this->api();

    $res = $client->client->get('/api/checks/'.$data['id']);
    $data = json_decode((string) $res->getBody());
    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response;
  }

  public function delete_check($data) {
    // get the ID check
    $client = $this->api();

    $res = $client->client->post('/api/checks/'.$data['id'].'/data');
    
    $data = json_decode((string) $res->getBody());

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response;
  }

  public function list_checks(WP_REST_Request $request) {
    // checks index page
    $client = $this->api();
    $params = $request->get_query_params();

    $res = $client->client->get('/api/checks', array( 'query' => $params ));

    $data = json_decode((string) $res->getBody());
    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response;
  }

  public function update_settings(WP_REST_Request $request) {
    // update shop settings
    $client = $this->api();
    $body = $request->get_params();

    $update_res = $client->client->post('/api/shop/settings/v2', array( 'json' => $body ));
    
    if($update_res->getStatusCode() != 200) {
      $failed_response = new WP_REST_Response(json_decode((string) $update_res->getBody()));
      $failed_response->set_status($update_res->getStatusCode());
      return $failed_response;
    }
    // this is a hack, but the current settings also need to include the sandbox mode flag
    $res = $client->client->get('/api/shop');
    $data = json_decode((string) $res->getBody(), true);

    if(function_exists('wc_get_order_statuses')) {
      $available_order_statuses = wc_get_order_statuses();
      $data['wc_available_order_statuses'] = $available_order_statuses;
    }

    // update the transient cache for the public settings served on the frontend
    real_id_sync_shop_public_settings($client);

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    // set the local option
    update_option('real_id_delivery_methods', $data['settings']['deliveryMethods']);

    return $response;
  }

  /**
   * Get public shop settings
   * 
   * Prefer the cache, but retrieve if expired
   */
  public function get_shop_public_settings(WP_REST_Request $request) {
    // attempt to load the shop settings from cache, and if not available then over the API
    $client = $this->api();

    try {
      $settings = real_id_get_shop_public_settings($client);
      $response = new WP_REST_Response(['shopSettings' => $settings]);
      $response->set_status(200);

      return $response;
    } catch(Exception $e) {
        $failed_response = new WP_REST_Response([ 'error' => $e->getMessage()]);
        $failed_response->set_status(500);
        return $failed_response;
    }
  }

  public function update_delivery_methods(WP_REST_Request $request) {
    // update shop settings on the main API
    $client = $this->api();
    $body = $request->get_params();

    // set the local option
    update_option('real_id_delivery_methods', $body['deliveryMethods']);

    $res = $client->client->post('/api/shop/settings', array( 'json' => $body ));
    $data = json_decode((string) $res->getBody());
    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response;
  }

  public function activate_license_key(WP_REST_Request $request) {
    $licenseKey = $request['licenseKey'];
    $client = new ApiClient($licenseKey);
    $body = array( 'url' => home_url() );

    $res = $client->client->post('/api/shop/license/'.$licenseKey.'/activate', array( 'json' => $body ));
    $data = json_decode((string) $res->getBody());
    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    if($res->getStatusCode() == 200) {
      // store the license key locally so we can make authenticated requests
      update_site_option('real_id_license_key', $licenseKey);
      update_site_option('real_id_sandbox_mode', $data->sandboxMode);
    }
    
    return $response;
  }

  public function deactivate_license_key(WP_REST_Request $request) {
    $currentLicenseKey = get_option('real_id_license_key');
    $client = $this->api();

    $res = $client->client->post('/api/shop/license/'.$currentLicenseKey.'/deactivate');
    $data = json_decode((string) $res->getBody());
    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    if($res->getStatusCode() == 200) {
      delete_option('real_id_license_key');
      update_option('real_id_sandbox_mode', true);
    }


    return $response;
  }

  public function deliver_check_reminder(WP_REST_Request $request) {
    // get the ID check
    $client = $this->api();
    $params = $request->get_params();
    $id = $params['id'];

    $res = $client->client->post('/api/checks/'.$id.'/deliver/reminder', array ( 'json' => $request->get_params() ));
    $data = json_decode((string) $res->getBody());
    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode()); 

    return $response;
  }

  public function manually_approve_check(WP_REST_Request $request) {
    // get the ID check
    $client = $this->api();

    $res = $client->client->post('/api/checks/'.$request->get_params()['id'].'/manual-approval');
    $data = json_decode((string) $res->getBody());
    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response;
  }

  public function manually_reject_check(WP_REST_Request $request) {
    // get the ID check
    $client = $this->api();
    $params = $request->get_params();

    $res = $client->client->post('/api/checks/'.$request->get_params()['id'].'/manual-rejection');
    $data = json_decode((string) $res->getBody());

    // cancel and refund there's a passed order and the merchant wants to cancel and refund
    if(isset($params['cancel_and_refund']) && !!$params['cancel_and_refund'] && !empty($params['wc_order_id'])) {
      real_id_cancel_and_refund_order($params['wc_order_id']);
    }

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response;
  }

  public function associate_check_with_order(WP_REST_Request $request) {
    $client = $this->api();
    $res = $client->client->post('/api/webhooks/wc/associate-check-with-order', ['json' => $request->get_params()]);
    $data = json_decode((string) $res->getBody());

    if($res->getStatusCode() == 200) {
      $params = $request->get_params();
      $order_id = $params['orderId'];
      $check_id = $params["checkId"];
      $customer_id = $params["customerId"];

      $order = wc_get_order( $order_id );

      if(!$order) {
        $response = new WP_REST_Response([ "message" => "order not found", "order_id" => $order_id, "check_id" => $check_id ]);
        $response->set_status(422);
        return $response;
      }

      $order->update_meta_data( 'real_id_check_id', $check_id );
      $order->save();
    }

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response; 
  }

  public function add_email_sender_signature(WP_REST_Request $request) {
    $client = $this->api();
    $res = $client->client->post('/api/shop/email-signature/add', ['json' => $request->get_params()]);
    $data = json_decode((string) $res->getBody());

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response; 
  }

  public function check_email_sender_signature_verification_status(WP_REST_Request $request) {
    $client = $this->api();
    $res = $client->client->post('/api/shop/email-signature/check-verification-status', ['json' => $request->get_params()]);
    $data = json_decode((string) $res->getBody());

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response; 
  }

  public function check_email_sender_signature_dkim_status(WP_REST_Request $request) {
    $client = $this->api();
    $res = $client->client->post('/api/shop/email-signature/check-dkim', ['json' => $request->get_params()]);
    $data = json_decode((string) $res->getBody());

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response; 
  }

  public function check_email_sender_signature_return_path_status(WP_REST_Request $request) {
    $client = $this->api();
    $res = $client->client->post('/api/shop/email-signature/check-return-path', ['json' => $request->get_params()]);
    $data = json_decode((string) $res->getBody());

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response; 
  }


  public function remove_email_sender_signature(WP_REST_Request $request) {
    $client = $this->api();
    $res = $client->client->post('/api/shop/email-signature/remove', ['json' => $request->get_params()]);
    $data = json_decode((string) $res->getBody());

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response; 
  }

  public function reset_to_sandbox_mode(WP_REST_Request $request) {
    $sandboxLicenseKey = get_option('real_id_sandbox_license_key');

    if($sandboxLicenseKey) {
      $client = $this->api();
      // reset shop settings as well
      $reset_res = $client->client->post('/api/shop/license/reset-sandbox-mode', ['json' => [
        'sandboxLicenseKey' => get_option('real_id_sandbox_license_key'),
      ]]);

      if($reset_res->getStatusCode() !== 200) {
        $reset_res_data = json_decode((string) $reset_res->getBody());
        $response = new WP_REST_Response($reset_res_data);
        $response->set_status($reset_res->getStatusCode());
        return $response;
      }
      update_option('real_id_license_key', $sandboxLicenseKey);
      update_option('real_id_sandbox_mode', true);
    } else {
      // sandbox license key doesn't exist at all, activate the install
      $client = new ApiClient();

      $res = $client->client->post('/api/shop/wc/install', [ 'json' => [
        'url' => home_url(),
      ]]);

      $data = json_decode((string) $res->getBody());

      if($res->isSuccessful()) {
        update_option('real_id_sandbox_license_key', $data->shop->licenseKey);
        update_option('real_id_sandbox_mode', true);
      }          
    }
    // get shop settings

    $res = $client->client->get('/api/shop');
    $data = json_decode((string) $res->getBody());

    $response = new WP_REST_Response($data);
    $response->set_status($res->getStatusCode());

    return $response; 
  }

  public function get_current_license_key(WP_REST_Request $request) {
    $license_key = real_id_get_license_key();

    $response = new WP_REST_Response([
      'license_key' => $license_key,
      'sandbox_mode' => real_id_in_sandbox_mode()
    ]);
    $response->set_status(200);

    return $response; 
  }

  public function get_order(WP_REST_Request $request) {
    $params = $request->get_params();
    $data = [];

    if(empty($params['id'])) {
        $response = new WP_REST_Response([
          'message' => 'id required'
        ]);
        $response->set_status(422);

        return $response; 
    }

    $order = wc_get_order($params['id']);
    if(!$order) {
        $response = new WP_REST_Response([
          'message' => sprintf("No order found for ID %s", $params['id']),
        ]);
        $response->set_status(422);

        return $response; 
    }

    $order_data = real_id_get_order_data($params['id']);

    $response = new WP_REST_Response($order_data);
    $response->set_status(200);

    return $response;
  }

  public function search_orders(WP_REST_Request $request) {
    $params = $request->get_params();
    
    // https://github.com/woocommerce/woocommerce/wiki/wc_get_orders-and-WC_Order_Query
    $orders = wc_get_orders(array_merge($params, ['paginate' => true ]));
    $ordersData = array_map(function($order) {
        return $order->data;
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

  public function search_customers(WP_REST_Request $request) {
    $params = $request->get_params();

    // https://developer.wordpress.org/reference/classes/wp_user_quer
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

  /**
   * Set the real_id_check_id into the WC session for retrieval after checkout assocation
   */
  public function set_wc_session(WP_REST_Request $request) {
    $params = $request->get_params();

    $check_id = $params['check_id'];

      wc_get_logger()->debug(
        'Set real_id_check_id session key API endpoint hit',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          "hook" => "set_wc_session",
          'params' => $params,
        )
      );

    $response = new WP_REST_Response();

    // apparently you need to load the cart first
    // https://wordpress.stackexchange.com/a/426531/93429
    wc_load_cart();

    if(!empty($check_id)) {
      WC()->session->set('real_id_check_id', $check_id);
      wc_get_logger()->debug(
        'Set real_id_check_id session key',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          "hook" => "set_wc_session",
          'real_id_check_id' => $check_id
        )
      );

      $response->set_status(200);
    } else {
      $response->set_status(422);
      wc_get_logger()->debug(
        'Set real_id_check_id session key missing, no action',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          'real_id_check_id' => null,
        )
      );
    }

    return $response; 
  }
}

