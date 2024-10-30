<?php

/**
 *  Die & dump baby, die & dump
 */
function ridd($prop) {
  die(var_dump($prop));
}

/**
 * Is pre-checkout delivery enabled?
 * 
 * @return Boolean
 */
function real_id_is_pre_checkout_enabled() {
  $delivery_methods = get_option('real_id_delivery_methods');
  
  if(!$delivery_methods) {
    $delivery_methods = [];
  }

  return in_array('preCheckout', $delivery_methods);
}

function real_id_in_sandbox_mode() {
  return get_option('real_id_sandbox_mode');
}


  /**
   * Return the license key depending on if the shop is in test or live mode
   * 
   * @return string
   */
  function real_id_get_license_key() {
    $licenseKey = get_option('real_id_license_key');
    if($licenseKey) {
      return $licenseKey;
    }

    $sandboxLicenseKey = get_option('real_id_sandbox_license_key');
    return $sandboxLicenseKey;
  }

  /**
   * Return the shop name, used as the primary key for the shop
   * 
   * @return string
   */
  function real_id_get_shop_name() {
    return home_url();
  }

  /**
   * Return the order data as JSON
   */
  function real_id_get_order_data($order_id) {
    $order = wc_get_order( $order_id );
    $order_data = json_decode((string) $order, true);

    // include line items
    $line_items = $order->get_items();
    $transformed = array_map(function ($line_item) {
      $product = $line_item->get_product();

      // product variants do not have categories.
      //   so if this is a variant, grab the parent product
      if($product->is_type( 'variation' )) {
        $product_id = $product->get_parent_id();
        $product = wc_get_product($product_id);
      }

      return array_merge($line_item->get_data(), [ 'category_ids' => $product->get_category_ids(), 'tag_ids' => $product->get_tag_ids() ]);
    }, $line_items);

    // place all individual line_items category_id's into one array for easy processing
    $order_data['category_ids'] = array_reduce($transformed, function ($carry, $current) {
      return array_merge($carry, $current['category_ids']);
    }, []);

    if($order->get_user()) {
      $customer = $order->get_user()->to_array();
      unset($customer['user_pass']);
      $order_data['customer'] = [
        'id' => $customer['ID'],
        'email' => $customer['user_email'],
        'meta' => [
          'real_id_check_status' => get_user_meta($customer['ID'], 'real_id_check_status', true),
          'real_id_check_id' => get_user_meta($customer['ID'], 'real_id_check_id', true),
        ]
      ];

      // I really don't believe most WC shops have a first name & last name field
      // from my testing, it seems like billing name becomes the customer name if they have account creation enabled
      if(array_key_exists('first_name', $customer)) {
        $order_data['customer']['first_name'] = $customer['first_name'];
      }

      if(array_key_exists('last_name', $customer)) {
        $order_data['customer']['last_name'] = $customer['last_name'];
      }
    }

    $order_data['line_items'] = $transformed;

    return $order_data;
  }

  /**
   * Return the customer data as JSON
   */
  function real_id_get_current_user_data() {
    $user_id = get_current_user_id();

    if(!$user_id) {
      return null;
    }

    $user = get_userdata($user_id);

    if($user) {
      return $user_data = [
          'id' => $user_id,
          'roles' => (array) $user->roles,
          'email' => $user->user_email,
          'username' => $user->user_login,
          'display_name' => $user->display_name,
          'registered_at' => $user->user_registered,
          'first_name' => get_user_meta($user_id, 'first_name'),
          'last_name' => get_user_meta($user_id, 'last_name'),
      ];
    } else {
      return null;
    }
  }

  /**
   * Get Real ID cached shop's delivery methods
   */
  function real_id_get_shop_delivery_methods() {
    return get_option('real_id_delivery_methods');
  }

  /**
   * Get or set the latest public shop settings
   * 
   * If the cache doesn't have the shop settings, this function will sync the latest
   */
  function real_id_get_shop_public_settings($client) {
    $value = get_transient( 'real_id_shop_public_settings' );

    if ( false === $value) {
      // this code runs when there is no valid transient set
      // get shop settings from the Real ID API
      $value = real_id_sync_shop_public_settings($client);
    }

    return $value;
  }

  /**
   * Force an update to the public shop settings
   */
  function real_id_sync_shop_public_settings($client) {
      $get_res = $client->client->get('/api/shop/public/settings');


      if ( !$get_res->isSuccessful() ) {
       // Throw an exception with the error message
        throw new Exception( $get_res->get_error_message() );
      }

      $data = json_decode((string) $get_res->getBody(), true);

      if(empty($data['shopSettings'])) {
        throw new Exception('Empty shop settings');
      }

      real_id_set_shop_public_settings($data['shopSettings']);

      return $data['shopSettings'];
  }

  function real_id_set_shop_public_settings($shopSettings) {
      set_transient('real_id_shop_public_settings', $shopSettings, 12 * HOUR_IN_SECONDS);
  }

  function real_id_cancel_and_refund_order($order_id) {
    // Get the order object
    $order = wc_get_order( $order_id );

    if ( ! $order ) {
        return new WP_Error( 'invalid_order', 'Invalid order ID' );
    }

    // Check if the order can be canceled
    if ( $order->get_status() !== 'cancelled' ) {
        // Cancel the order
        $order->update_status('cancelled');
    }

    // Prepare the refund
    $refund_amount = $order->get_total();
    $refund_reason = 'ID check manually rejected';
    $refund_data = array(
        'amount'     => $refund_amount,
        'reason'     => $refund_reason,
        'order_id'   => $order_id,
        'refund_id'  => 0,
        'line_items' => array()
    );

    // Create the refund
    $refund = wc_create_refund( $refund_data );

    if ( is_wp_error( $refund ) ) {
        return $refund; // Return error if refund creation failed
    }

    return $refund; // Return the refund object if successful
  }