<?php
/**
 * Template Functions
 *
 * @package Narayane_Sena
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get user's referral code
 */
function ns_get_user_referral_code($user_id) {
    return get_user_meta($user_id, 'ns_referral_code', true);
}

/**
 * Get user's total earnings
 */
function ns_get_user_total_earnings($user_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_earnings';
    
    $total = $wpdb->get_var($wpdb->prepare(
        "SELECT SUM(amount) FROM $table_name WHERE user_id = %d AND status = 'paid'",
        $user_id
    ));
    
    return $total ? floatval($total) : 0;
}

/**
 * Get user's pending earnings
 */
function ns_get_user_pending_earnings($user_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_earnings';
    
    $total = $wpdb->get_var($wpdb->prepare(
        "SELECT SUM(amount) FROM $table_name WHERE user_id = %d AND status = 'pending'",
        $user_id
    ));
    
    return $total ? floatval($total) : 0;
}

/**
 * Get user's referral count
 */
function ns_get_referral_count($user_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_earnings';
    
    $count = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM $table_name WHERE user_id = %d",
        $user_id
    ));
    
    return $count ? intval($count) : 0;
}

/**
 * Get user's earnings history
 */
function ns_get_earnings_history($user_id, $limit = 10) {
    global $wpdb;
    $table_earnings = $wpdb->prefix . 'ns_earnings';
    
    return $wpdb->get_results($wpdb->prepare(
        "SELECT e.*, u.display_name as referred_user_name 
         FROM $table_earnings e 
         LEFT JOIN {$wpdb->users} u ON e.referred_user_id = u.ID 
         WHERE e.user_id = %d 
         ORDER BY e.created_at DESC 
         LIMIT %d",
        $user_id,
        $limit
    ));
}

/**
 * Get active payment QR code
 */
function ns_get_active_qr_code() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_payment_qr_codes';
    
    return $wpdb->get_row(
        "SELECT * FROM $table_name WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
    );
}

/**
 * Format currency
 */
function ns_format_currency($amount) {
    return '₹' . number_format($amount, 2);
}

/**
 * Get membership status badge
 */
function ns_get_membership_badge($status) {
    $badges = array(
        'pending' => '<span class="badge badge-warning">Pending</span>',
        'active' => '<span class="badge badge-success">Active</span>',
        'inactive' => '<span class="badge badge-danger">Inactive</span>',
        'rejected' => '<span class="badge badge-danger">Rejected</span>',
    );
    
    return isset($badges[$status]) ? $badges[$status] : $badges['inactive'];
}

/**
 * Get earnings status badge
 */
function ns_get_earnings_badge($status) {
    $badges = array(
        'pending' => '<span class="badge badge-warning">Pending</span>',
        'paid' => '<span class="badge badge-success">Paid</span>',
    );
    
    return isset($badges[$status]) ? $badges[$status] : $badges['pending'];
}

/**
 * Check if user can purchase membership
 */
function ns_can_purchase_membership($user_id) {
    return !ns_has_active_membership($user_id);
}

/**
 * Get user membership details
 */
function ns_get_user_membership($user_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_memberships';
    
    return $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_id = %d ORDER BY created_at DESC LIMIT 1",
        $user_id
    ));
}
