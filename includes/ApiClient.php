<?php
namespace RealID;

// use GuzzleHttp\Client;
use RealID\WpHttpClient;

class ApiClient {
  public $client;
  public $options;

  public function __construct($licenseKey = null, $additionalOptions = []) {
    $options = array( 'base_uri' => 'https://real-id.getverdict.com', 'http_errors' => false, 'headers' => ['Content-Type' => 'application/json'] );
    $options =  array_merge($options, $additionalOptions);

    if(defined('REAL_ID_API_HOST')) {
      $options['base_uri'] = REAL_ID_API_HOST;
    }

    if(getenv('REAL_ID_API_HOST')) {
      $options['base_uri'] = getenv('REAL_ID_API_HOST');
    }

    if(isset($licenseKey)) {
      $options['headers'] = array(
        'Authorization' => 'Bearer ' . $licenseKey,
        'Content-Type' => 'application/json',
      );
    } else {
      $options['headers'] = ['Content-Type' => 'application/json'];
    }

    $this->options = array_merge($options, ['license_key' => $licenseKey, 'sandbox_mode' => get_option('real_id_sandbox_mode')]);
    $this->client = new WpHttpClient($options);
  }

  public function getOptions() {
    return $this->options;
  }
}
