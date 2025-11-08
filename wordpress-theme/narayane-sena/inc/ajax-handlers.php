<?php
/**
 * AJAX Handlers
 *
 * @package Narayane_Sena
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handle user registration
 */
function ns_ajax_register_user() {
    check_ajax_referer('ns-nonce', 'nonce');
    
    $full_name = sanitize_text_field($_POST['full_name']);
    $username = sanitize_user($_POST['username']);
    $email = sanitize_email($_POST['email']);
    $phone = sanitize_text_field($_POST['phone']);
    $password = $_POST['password'];
    $referral_code = sanitize_text_field($_POST['referral_code']);
    
    // Validate required fields
    if (empty($username) || empty($email) || empty($password)) {
        wp_send_json_error(array('message' => 'All fields are required!'));
    }
    
    // Check if username exists
    if (username_exists($username)) {
        wp_send_json_error(array('message' => 'Username already exists!'));
    }
    
    // Check if email exists
    if (email_exists($email)) {
        wp_send_json_error(array('message' => 'Email already exists!'));
    }
    
    // Create user
    $user_id = wp_create_user($username, $password, $email);
    
    if (is_wp_error($user_id)) {
        wp_send_json_error(array('message' => $user_id->get_error_message()));
    }
    
    // Update user meta
    update_user_meta($user_id, 'first_name', $full_name);
    update_user_meta($user_id, 'ns_phone', $phone);
    update_user_meta($user_id, 'ns_referred_by', $referral_code);
    
    wp_send_json_success(array('message' => 'Registration successful!'));
}
add_action('wp_ajax_nopriv_ns_register_user', 'ns_ajax_register_user');

/**
 * Handle membership purchase
 */
function ns_ajax_purchase_membership() {
    check_ajax_referer('ns-nonce', 'nonce');
    
    if (!is_user_logged_in()) {
        wp_send_json_error(array('message' => 'Please login first!'));
    }
    
    $user_id = get_current_user_id();
    $coupon_code = sanitize_text_field($_POST['coupon_code']);
    
    // Check if user already has membership
    if (ns_has_active_membership($user_id)) {
        wp_send_json_error(array('message' => 'You already have an active membership!'));
    }
    
    // Calculate price
    $amount = ns_get_membership_price($coupon_code);
    
    // Handle file upload
    if (!isset($_FILES['payment_screenshot'])) {
        wp_send_json_error(array('message' => 'Please upload payment screenshot!'));
    }
    
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    $upload = wp_handle_upload($_FILES['payment_screenshot'], array('test_form' => false));
    
    if (isset($upload['error'])) {
        wp_send_json_error(array('message' => $upload['error']));
    }
    
    // Insert membership record
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_memberships';
    
    $wpdb->insert($table_name, array(
        'user_id' => $user_id,
        'amount' => $amount,
        'coupon_code' => $coupon_code,
        'payment_qr_image' => $upload['url'],
        'status' => 'pending',
        'created_at' => current_time('mysql')
    ));
    
    wp_send_json_success(array('message' => 'Membership purchase request submitted! Please wait for admin approval.'));
}
add_action('wp_ajax_ns_purchase_membership', 'ns_ajax_purchase_membership');

/**
 * Handle membership approval
 */
function ns_ajax_approve_membership() {
    check_ajax_referer('ns-nonce', 'nonce');
    
    if (!current_user_can('administrator')) {
        wp_send_json_error(array('message' => 'Unauthorized!'));
    }
    
    $membership_id = intval($_POST['membership_id']);
    
    global $wpdb;
    $table_memberships = $wpdb->prefix . 'ns_memberships';
    
    // Get membership details
    $membership = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_memberships WHERE id = %d",
        $membership_id
    ));
    
    if (!$membership) {
        wp_send_json_error(array('message' => 'Membership not found!'));
    }
    
    // Update membership status
    $wpdb->update(
        $table_memberships,
        array(
            'status' => 'active',
            'approved_at' => current_time('mysql')
        ),
        array('id' => $membership_id)
    );
    
    // Update user meta
    update_user_meta($membership->user_id, 'ns_membership_status', 'active');
    update_user_meta($membership->user_id, 'ns_status', 'approved');
    
    // Process referral earning if applicable
    $referred_by_code = get_user_meta($membership->user_id, 'ns_referred_by', true);
    
    if (!empty($referred_by_code)) {
        // Find referrer user
        $referrer_id = $wpdb->get_var($wpdb->prepare(
            "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = 'ns_referral_code' AND meta_value = %s",
            $referred_by_code
        ));
        
        if ($referrer_id) {
            $table_earnings = $wpdb->prefix . 'ns_earnings';
            
            // Create earning record
            $wpdb->insert($table_earnings, array(
                'user_id' => $referrer_id,
                'referred_user_id' => $membership->user_id,
                'amount' => ns_get_referral_amount(),
                'status' => 'pending',
                'created_at' => current_time('mysql')
            ));
        }
    }
    
    wp_send_json_success(array('message' => 'Membership approved successfully!'));
}
add_action('wp_ajax_ns_approve_membership', 'ns_ajax_approve_membership');

/**
 * Handle membership rejection
 */
function ns_ajax_reject_membership() {
    check_ajax_referer('ns-nonce', 'nonce');
    
    if (!current_user_can('administrator')) {
        wp_send_json_error(array('message' => 'Unauthorized!'));
    }
    
    $membership_id = intval($_POST['membership_id']);
    
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_memberships';
    
    $wpdb->update(
        $table_name,
        array('status' => 'rejected'),
        array('id' => $membership_id)
    );
    
    wp_send_json_success(array('message' => 'Membership rejected!'));
}
add_action('wp_ajax_ns_reject_membership', 'ns_ajax_reject_membership');

/**
 * Handle earnings payment
 */
function ns_ajax_mark_earning_paid() {
    check_ajax_referer('ns-nonce', 'nonce');
    
    if (!current_user_can('administrator')) {
        wp_send_json_error(array('message' => 'Unauthorized!'));
    }
    
    $earning_id = intval($_POST['earning_id']);
    
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_earnings';
    
    $wpdb->update(
        $table_name,
        array(
            'status' => 'paid',
            'paid_at' => current_time('mysql')
        ),
        array('id' => $earning_id)
    );
    
    wp_send_json_success(array('message' => 'Earning marked as paid!'));
}
add_action('wp_ajax_ns_mark_earning_paid', 'ns_ajax_mark_earning_paid');
