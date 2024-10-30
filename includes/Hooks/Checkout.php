<?php
namespace RealID\Hooks;
use RealID\ApiClient;

class Checkout {
    public function register() {
        // only validate checkout if pre-checkout is enabled
        $current_delivery_methods = real_id_get_shop_delivery_methods();
        
        if(isset($current_delivery_methods) && !empty($current_delivery_methods) && in_array('preCheckout', $current_delivery_methods)) {
            add_action( 'woocommerce_after_checkout_validation', [$this, 'validate_id_checked'], 10, 2 );
        }
    }

    /**
     * Validate that the customer has their ID checked
     */
    public function validate_id_checked($data, $errors) {
      wc_get_logger()->debug(
        'woocommerce_after_checkout_validation hook - initialize',
        array(
          'source'        => 'real_id',
          'backtrace'     => false,
          'data'   => $data,
        )
      );
        // get license key
        $licenseKey = real_id_get_license_key();
        $public_client = new ApiClient();

        $current_public_settings = real_id_get_shop_public_settings($public_client);
        
        // @TODO - include server side validation for specific categories on products
        // but for now let's keep it general to just shortcode checkout + all products validation on precheckout orders
        if(is_array($current_public_settings) && 
            isset($current_public_settings['requiredIdCategoriesEnabled']) &&
            // in addition for checking for presence, check for truthiness
            !!$current_public_settings['requiredIdCatoriesEnabled'] &&
            count($current_public_settings['requiredIdCategories']) > 0
        ) {
            // exit early, public settings include required ID categories
            wc_get_logger()->debug(
                'woocommerce_after_checkout_validation hook - exiting, has requiredIdCategories populated which are unsupported',
                array(
                'source'        => 'real_id',
                'backtrace'     => false,
                'data'   => $data,
                'current_public_settings' => $current_public_settings
                )
            );
            return;
        }
        

        wc_load_cart();
        $wc_session_check_id = WC()->session->get('real_id_check_id');


        // no ID check started, add an error to block checkout
        if(empty($wc_session_check_id)) {
            wc_get_logger()->debug(
                'woocommerce_after_checkout_validation hook - ID check missing in session',
                array(
                'source'        => 'real_id',
                'backtrace'     => false,
                'data'   => $data,
                'wc_session_check_id' => $wc_session_check_id
                )
            );
            $errors->add('validation', 'ID verification is required to checkout.');
            return;
        }

        $check_res = $public_client->client->get('/api/checks/'.$wc_session_check_id);
        

        if($check_res->isSuccessful()) {
            $check_data = json_decode($check_res->getBody(), true);

            if(
                isset($check_data['check']['step']) &&
                isset($check_data['check']['job']['result']['success']) && 
                $check_data['check']['step'] === 'completed' && 
                !!$check_data['check']['job']['result']['success']
                        ) {
                            // don't mess with validation, the customer is verified
                        wc_get_logger()->debug(
                            'woocommerce_after_checkout_validation hook - ID check API response successful, and verified',
                            array(
                            'source'        => 'real_id',
                            'backtrace'     => false,
                            'check_data'   => $check_data,
                            'wc_session_check_id' => $wc_session_check_id,
                            'check_step' => $check_data['check']['step'],
                            'check_success' => $check_data['check']['job']['result']['success'],
                            'check_res_status_code' => $check_res->getStatusCode(),
                            )
                        );
                return;
            } else {
                        $errors->add('validation', "ID verification is required to checkout.");
                        wc_get_logger()->debug(
                            'woocommerce_after_checkout_validation hook - ID check API response successful, but unverified',
                            array(
                            'source'        => 'real_id',
                            'backtrace'     => false,
                            'check_data'   => $check_data,
                            'wc_session_check_id' => $wc_session_check_id,
                            'check_res_status_code' => $check_res->getStatusCode(),
                            )
                        );
                        return;
            }
        } else {
            wc_get_logger()->debug(
                'woocommerce_after_checkout_validation hook - ID check API request failed',
                array(
                'source'        => 'real_id',
                'backtrace'     => false,
                'data'   => $data,
                'wc_session_check_id' => $wc_session_check_id,
                'check_res_status_code' => $check_res->getStatusCode(),
                )
            );
            $errors->add('validation', "ID verification is required to checkout.");
            return;
        }
    }
}