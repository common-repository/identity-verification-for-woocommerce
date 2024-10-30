<?php
namespace RealID\Hooks;
use RealID\ApiClient;

class Customers {
    public function register() {
        // only send webhooks if the registration-webhook is enabled.
        $current_delivery_methods = real_id_get_shop_delivery_methods();
        if($current_delivery_methods && in_array('registration-webhook', $current_delivery_methods)) {
            add_action( 'user_register', [$this, 'on_customer_create'] );
        }
    }

    public function on_customer_create($user_id) {
        $user = get_userdata($user_id);

        $user_data = [
            'id' => $user_id,
            'roles' => (array) $user->roles,
            'email' => $user->user_email,
            'username' => $user->user_login,
            'display_name' => $user->display_name,
            'registered_at' => $user->user_registered,
            'first_name' => get_user_meta($user_id, 'first_name'),
            'last_name' => get_user_meta($user_id, 'last_name'),
        ];

        // get license key
        $licenseKey = real_id_get_license_key();
        $client = new ApiClient($licenseKey, [ 'http_errors' => true ]);
        
        // POST to Real API
        $response = $client->client->post('/api/webhooks/wc/customers', array('json' => $user_data));
    }
}