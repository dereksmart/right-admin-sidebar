<?php
/**
 * Plugin Name: Right Admin Sidebar (Prototype)
 * Description: Injects a persistent right-hand sidebar into all wp-admin pages and pushes the UI left. Scaffolding only.
 * Version:     0.1.0
 * Author:      Your Name
 * License:     GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Right_Admin_Sidebar' ) ) {

	/**
	 * Main plugin class.
	 */
	final class Right_Admin_Sidebar {

		/**
		 * Singleton instance.
		 *
		 * @var Right_Admin_Sidebar
		 */
		private static $instance;

		/**
		 * Width in pixels for the sidebar. Filterable via 'right_admin_sidebar_width'.
		 *
		 * @var int
		 */
		private $width_px = 360;

		/**
		 * Get instance.
		 *
		 * @return Right_Admin_Sidebar
		 */
		public static function instance() {
			if ( ! isset( self::$instance ) ) {
				self::$instance = new self();
			}
			return self::$instance;
		}

		/**
		 * Constructor.
		 */
		private function __construct() {
			$this->width_px = (int) apply_filters( 'right_admin_sidebar_width', 360 );

			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
			add_action( 'admin_print_footer_scripts', array( $this, 'print_bootstrap_hook' ) );
		}

		/**
		 * Enqueue CSS/JS for all admin screens (including Site Editor under wp-admin).
		 */
		public function enqueue() {
			$ver = '0.1.0';

			wp_register_style(
				'right-admin-sidebar',
				plugins_url( 'assets/sidebar.css', __FILE__ ),
				array(),
				$ver
			);
			wp_enqueue_style( 'right-admin-sidebar' );

			wp_register_script(
				'right-admin-sidebar',
				plugins_url( 'assets/sidebar.js', __FILE__ ),
				array(),
				$ver,
				true
			);

			wp_localize_script(
				'right-admin-sidebar',
				'RightAdminSidebarConfig',
				array(
					'sidebarWidth' => $this->width_px,
				)
			);

			wp_enqueue_script( 'right-admin-sidebar' );
		}

		/**
		 * Prints a small bootstrap marker in the footer so the script can
		 * reliably inject after frameworks mount (covers SPA-like admin screens).
		 */
		public function print_bootstrap_hook() {
			echo '<div id="right-admin-sidebar-bootstrap" style="display:none"></div>';
		}
	}

	Right_Admin_Sidebar::instance();
}
