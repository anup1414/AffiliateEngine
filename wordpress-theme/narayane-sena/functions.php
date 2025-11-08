<?php
/**
 * Narayane Sena Theme Functions
 * 
 * @package Narayane_Sena
 * @version 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define theme constants
define('NS_VERSION', '1.0.0');
define('NS_THEME_DIR', get_template_directory());
define('NS_THEME_URL', get_template_directory_uri());

/**
 * Theme Setup
 */
function narayane_sena_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'narayane-sena'),
        'footer' => __('Footer Menu', 'narayane-sena'),
    ));
}
add_action('after_setup_theme', 'narayane_sena_setup');

/**
 * Enqueue scripts and styles
 */
function narayane_sena_scripts() {
    wp_enqueue_style('narayane-sena-style', get_stylesheet_uri(), array(), NS_VERSION);
    wp_enqueue_script('narayane-sena-script', NS_THEME_URL . '/assets/js/main.js', array('jquery'), NS_VERSION, true);
    
    // Localize script for AJAX
    wp_localize_script('narayane-sena-script', 'nsAjax', array(
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('ns-nonce')
    ));
}
add_action('wp_enqueue_scripts', 'narayane_sena_scripts');

/**
 * Create database tables on theme activation
 */
function narayane_sena_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Memberships table
    $table_memberships = $wpdb->prefix . 'ns_memberships';
    $sql_memberships = "CREATE TABLE IF NOT EXISTS $table_memberships (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        membership_type varchar(50) NOT NULL DEFAULT 'regular',
        amount decimal(10,2) NOT NULL,
        coupon_code varchar(50) DEFAULT NULL,
        payment_qr_image varchar(255) DEFAULT NULL,
        status varchar(20) NOT NULL DEFAULT 'pending',
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        approved_at datetime DEFAULT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";

    // Earnings table
    $table_earnings = $wpdb->prefix . 'ns_earnings';
    $sql_earnings = "CREATE TABLE IF NOT EXISTS $table_earnings (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        referred_user_id bigint(20) NOT NULL,
        amount decimal(10,2) NOT NULL DEFAULT '2000.00',
        status varchar(20) NOT NULL DEFAULT 'pending',
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        paid_at datetime DEFAULT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY referred_user_id (referred_user_id)
    ) $charset_collate;";

    // Payment QR Codes table
    $table_qr_codes = $wpdb->prefix . 'ns_payment_qr_codes';
    $sql_qr_codes = "CREATE TABLE IF NOT EXISTS $table_qr_codes (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        qr_image varchar(255) NOT NULL,
        upi_id varchar(100) DEFAULT NULL,
        is_active tinyint(1) NOT NULL DEFAULT 1,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_memberships);
    dbDelta($sql_earnings);
    dbDelta($sql_qr_codes);

    // Create admin user if not exists
    $admin_user = get_user_by('login', 'admin');
    if (!$admin_user) {
        $admin_password = get_option('ns_admin_password', 'NarayaneSena2024!');
        wp_create_user('admin', $admin_password, 'admin@narayanesena.com');
        
        $user_id = username_exists('admin');
        $user = get_user_by('id', $user_id);
        $user->set_role('administrator');
        
        update_user_meta($user_id, 'ns_is_admin', true);
        update_user_meta($user_id, 'first_name', 'Admin');
    }
}
register_activation_hook(__FILE__, 'narayane_sena_create_tables');

// Also run on theme switch
add_action('after_switch_theme', 'narayane_sena_create_tables');

/**
 * Add custom user meta fields
 */
function narayane_sena_user_registration($user_id) {
    // Generate unique referral code
    $referral_code = strtoupper(substr(md5($user_id . time()), 0, 8));
    update_user_meta($user_id, 'ns_referral_code', $referral_code);
    update_user_meta($user_id, 'ns_status', 'pending'); // pending, approved, rejected
    update_user_meta($user_id, 'ns_membership_status', 'inactive'); // inactive, active
}
add_action('user_register', 'narayane_sena_user_registration');

/**
 * Custom login redirect
 */
function narayane_sena_login_redirect($redirect_to, $request, $user) {
    if (isset($user->roles) && is_array($user->roles)) {
        if (in_array('administrator', $user->roles) || get_user_meta($user->ID, 'ns_is_admin', true)) {
            return home_url('/admin-dashboard/');
        } else {
            return home_url('/user-dashboard/');
        }
    }
    return $redirect_to;
}
add_filter('login_redirect', 'narayane_sena_login_redirect', 10, 3);

/**
 * Include template files
 */
require_once NS_THEME_DIR . '/inc/template-functions.php';
require_once NS_THEME_DIR . '/inc/ajax-handlers.php';
require_once NS_THEME_DIR . '/inc/admin-functions.php';

/**
 * Register custom page templates
 */
function narayane_sena_page_templates($templates) {
    $templates['templates/user-dashboard.php'] = 'User Dashboard';
    $templates['templates/admin-dashboard.php'] = 'Admin Dashboard';
    $templates['templates/membership-purchase.php'] = 'Membership Purchase';
    $templates['templates/login.php'] = 'Login/Register';
    return $templates;
}
add_filter('theme_page_templates', 'narayane_sena_page_templates');

/**
 * Load custom page templates
 */
function narayane_sena_load_template($template) {
    global $post;
    
    if (!$post) {
        return $template;
    }
    
    $page_template = get_post_meta($post->ID, '_wp_page_template', true);
    
    if ($page_template && file_exists(NS_THEME_DIR . '/' . $page_template)) {
        return NS_THEME_DIR . '/' . $page_template;
    }
    
    return $template;
}
add_filter('template_include', 'narayane_sena_load_template');

/**
 * Create default pages on activation
 */
function narayane_sena_create_default_pages() {
    $pages = array(
        'Login' => 'templates/login.php',
        'User Dashboard' => 'templates/user-dashboard.php',
        'Admin Dashboard' => 'templates/admin-dashboard.php',
        'Membership Purchase' => 'templates/membership-purchase.php',
    );
    
    foreach ($pages as $title => $template) {
        $page_check = get_page_by_title($title);
        
        if (!$page_check) {
            $page_id = wp_insert_post(array(
                'post_title' => $title,
                'post_content' => '',
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_author' => 1,
            ));
            
            if ($page_id) {
                update_post_meta($page_id, '_wp_page_template', $template);
            }
        }
    }
}
add_action('after_switch_theme', 'narayane_sena_create_default_pages');

/**
 * Membership price and coupon settings
 */
function ns_get_membership_price($coupon_code = '') {
    $regular_price = 5000;
    $discount_price = 2000;
    
    if (strtoupper($coupon_code) === 'SAVE3K') {
        return $discount_price;
    }
    
    return $regular_price;
}

/**
 * Get referral earnings amount
 */
function ns_get_referral_amount() {
    return 2000; // ₹2000 per successful referral
}

/**
 * Check if user is approved
 */
function ns_is_user_approved($user_id) {
    return get_user_meta($user_id, 'ns_status', true) === 'approved';
}

/**
 * Check if user has active membership
 */
function ns_has_active_membership($user_id) {
    return get_user_meta($user_id, 'ns_membership_status', true) === 'active';
}
