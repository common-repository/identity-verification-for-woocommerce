<?php
namespace RealID;

/**
 * Thin wrapper around the WP response to make it act like a Guzzle response
 */
class WpHttpResponse {
    public $response;
    public $body;
    public $statusCode;

    public function __construct($response) {
        $this->response;
        $this->body = $this->parseResponse($response);
        $this->statusCode = $this->parseStatusCode($response);
    }

    public function getBody() {
        return $this->body;
    }

    public function getStatusCode() {
        return $this->statusCode;
    }
	
	public function parseResponse($response) {
		if( is_wp_error( $response ) ) {
		  $error = $response->get_error_message();
		  $payload = json_encode(["ok" => false, "error" => $error]);
		  return $payload;
        }
		return wp_remote_retrieve_body($response);
	}
	
	public function parseStatusCode($response) {
		$code = wp_remote_retrieve_response_code($response);
		
        if ($code === '') {
			$code = 500;
		}

		return $code;
	}

    public function isSuccessful() {
        return !is_wp_error($this->response);
    }
}