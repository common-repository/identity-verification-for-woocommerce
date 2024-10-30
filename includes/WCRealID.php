<?php
namespace RealID;

use RealID\Hooks\Orders;
use RealID\Hooks\Customers;
use RealID\Hooks\Checkout;

use Psr\Log\LoggerInterface;

/**
 * Integration Demo Integration.
 *
 * @package  WC_Integration_Demo_Integration
 * @category Integration
 * @author   WooThemes
 */
class WCRealID extends \WC_Integration {

	/**
	 * Init and hook in the integration.
	 */
	public function __construct() {
		global $woocommerce;
        // Admin menus
        add_action('admin_menu', array($this, 'init_settings_menu'));

        $orders = real_id_app()->get(Orders::class);
        $orders->register();

        $customers = real_id_app()->get(Customers::class);
        $customers->register();

        $customers = real_id_app()->get(Checkout::class);
        $customers->register();
	}

  public function init_settings_menu() {
      add_menu_page(
          'ID Checks',
          'ID Checks',
          'manage_options',
          'real-id',
          array($this, 'renderReactRoot'),
          'data:image/svg+xml;base64,' . base64_encode('<svg className="h-8 w-auto sm:h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z" clipRule="evenodd" /><path fillRule="evenodd" d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 005 11zm8.921 2.012a1 1 0 01.831 1.145 19.86 19.86 0 01-.545 2.436 1 1 0 11-1.92-.558c.207-.713.371-1.445.49-2.192a1 1 0 011.144-.83z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 10a1 1 0 011 1c0 2.236-.46 4.368-1.29 6.304a1 1 0 01-1.838-.789A13.952 13.952 0 009 11a1 1 0 011-1z" clipRule="evenodd" /></svg>')
      );

      add_submenu_page(
          'real-id',
          'New ID check',
          'New ID check',
          'manage_options',
          'real-id#/new',
          [$this, 'renderReactRoot']
      );

      add_submenu_page(
          'real-id',
          'Settings',
          'Settings',
          'manage_options',
          'real-id#/settings',
          [$this, 'renderReactRoot']
      );
  }

  public function renderReactRoot()
  {
      echo '<div id="real-id-mount"></div>';
  }
}

