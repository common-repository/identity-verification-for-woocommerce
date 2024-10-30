<?php
namespace RealID;

use RealID\WpHttpResponse;


/**
 * Thin WP wrapper around Guzzle to make ApiClient act like Guzzle
 */
class WpHttpClient {
    public $options = [];

    public function __construct($options = []) {
        $this->options = $options;
    }

    public function get($path, $data = []) {

        $args = [
            "headers" => $this->options['headers'] ?? [],
        ];

        $url = sprintf('%s%s', $this->options['base_uri'], $path);

        if(isset($data['query']) && !empty($data['query'])) {
            $query = http_build_query($data['query'], NULL, '&', PHP_QUERY_RFC3986);
            $url = $url . '?' . $query;
        }

        $response = wp_remote_get($url, $args);

        return new WpHttpResponse($response);
    }

    public function post($path, $body = []) {
        $url = sprintf('%s%s', $this->options['base_uri'], $path);
        $args = [
            'headers' => $this->options['headers'] ?? [],
            'body' => json_encode($body['json']),
        ];

        $response = wp_remote_post($url, $args);

        return new WpHttpResponse($response);
    }
}