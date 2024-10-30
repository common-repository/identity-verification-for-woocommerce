<?php
namespace RealID;

use DI\Container;
use DI\ContainerBuilder;
use RealID\Hooks\Orders;
use RealID\Hooks\Customers;
use RealID\Hooks\Checkout;
use RealID\Interfaces\Views;
use RealID\TemplateEngine;
use Twig\Loader\FilesystemLoader;
use Twig\Environment;
use RealID\Models\IDCheck;

function real_id_app() {
  $containerBuilder = new ContainerBuilder();
  $containerBuilder->useAutowiring(true);

  $containerBuilder->addDefinitions([
    Views::class => function () {
      $loader = new \Twig\Loader\FilesystemLoader(__DIR__.'/views');
      $twig = new \Twig\Environment($loader, [
          'cache' => false,
          'debug' => (getenv('APP_ENV') == 'development' || defined('REAL_ID_DEV')),
      ]);

      $check_status_badge_filter = new \Twig\TwigFilter('check_status_badge', function ($check_status) {
        if(in_array($check_status, IDCheck::IN_PROGRESS_STATUSES)) {
          return 'order-status status-processing';
        }

        if(in_array($check_status, IDCheck::IN_REVIEW_STATUSES)) {
          return 'order-status status-on-hold';
        }

        if(in_array($check_status, IDCheck::COMPLETED_STATUSES)) {
          return 'order-status status-completed';
        }

        if(in_array($check_status, IDCheck::FAILED_STATUSES)) {
          return 'order-status status-failed';
        }
      });
      $twig->addFilter($check_status_badge_filter);

      $check_status_canoncial_translation = new \Twig\TwigFilter('translate_check_status', function($check_status) {
        return IDCheck::translate_canonical_status($check_status);
      });
      $twig->addFilter($check_status_canoncial_translation);

      return new TemplateEngine($twig);
    }
  ]);



  $container = $containerBuilder->build();
  return $container;
}
