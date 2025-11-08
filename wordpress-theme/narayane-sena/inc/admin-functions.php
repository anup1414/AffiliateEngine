<?php
/**
 * Admin Functions
 *
 * @package Narayane_Sena
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get all users with pagination
 */
function ns_get_all_users($page = 1, $per_page = 20) {
    $offset = ($page - 1) * $per_page;
    
    $args = array(
        'number' => $per_page,
        'offset' => $offset,
        'orderby' => 'registered',
        'order' => 'DESC',
    );
    
    return get_users($args);
}

/**
 * Get total users count
 */
function ns_get_total_users_count() {
    $count = count_users();
    return $count['total_users'];
}

/**
 * Get pending memberships
 */
function ns_get_pending_memberships() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_memberships';
    
    return $wpdb->get_results(
        "SELECT m.*, u.display_name, u.user_email 
         FROM $table_name m 
         LEFT JOIN {$wpdb->users} u ON m.user_id = u.ID 
         WHERE m.status = 'pending' 
         ORDER BY m.created_at DESC"
    );
}

/**
 * Get all memberships
 */
function ns_get_all_memberships($status = null) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_memberships';
    
    $query = "SELECT m.*, u.display_name, u.user_email 
              FROM $table_name m 
              LEFT JOIN {$wpdb->users} u ON m.user_id = u.ID";
    
    if ($status) {
        $query .= $wpdb->prepare(" WHERE m.status = %s", $status);
    }
    
    $query .= " ORDER BY m.created_at DESC";
    
    return $wpdb->get_results($query);
}

/**
 * Get pending earnings
 */
function ns_get_pending_earnings() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_earnings';
    
    return $wpdb->get_results(
        "SELECT e.*, 
                u1.display_name as user_name,
                u2.display_name as referred_user_name 
         FROM $table_name e 
         LEFT JOIN {$wpdb->users} u1 ON e.user_id = u1.ID 
         LEFT JOIN {$wpdb->users} u2 ON e.referred_user_id = u2.ID 
         WHERE e.status = 'pending' 
         ORDER BY e.created_at DESC"
    );
}

/**
 * Get all earnings
 */
function ns_get_all_earnings() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'ns_earnings';
    
    return $wpdb->get_results(
        "SELECT e.*, 
                u1.display_name as user_name,
                u2.display_name as referred_user_name 
         FROM $table_name e 
         LEFT JOIN {$wpdb->users} u1 ON e.user_id = u1.ID 
         LEFT JOIN {$wpdb->users} u2 ON e.referred_user_id = u2.ID 
         ORDER BY e.created_at DESC"
    );
}

/**
 * Get platform statistics
 */
function ns_get_platform_stats() {
    global $wpdb;
    
    $stats = array();
    
    // Total users
    $stats['total_users'] = ns_get_total_users_count();
    
    // Active memberships
    $table_memberships = $wpdb->prefix . 'ns_memberships';
    $stats['active_memberships'] = $wpdb->get_var(
        "SELECT COUNT(*) FROM $table_memberships WHERE status = 'active'"
    );
    
    // Pending memberships
    $stats['pending_memberships'] = $wpdb->get_var(
        "SELECT COUNT(*) FROM $table_memberships WHERE status = 'pending'"
    );
    
    // Total revenue
    $stats['total_revenue'] = $wpdb->get_var(
        "SELECT SUM(amount) FROM $table_memberships WHERE status = 'active'"
    );
    $stats['total_revenue'] = $stats['total_revenue'] ? floatval($stats['total_revenue']) : 0;
    
    // Pending earnings
    $table_earnings = $wpdb->prefix . 'ns_earnings';
    $stats['pending_earnings'] = $wpdb->get_var(
        "SELECT SUM(amount) FROM $table_earnings WHERE status = 'pending'"
    );
    $stats['pending_earnings'] = $stats['pending_earnings'] ? floatval($stats['pending_earnings']) : 0;
    
    // Total paid earnings
    $stats['total_paid_earnings'] = $wpdb->get_var(
        "SELECT SUM(amount) FROM $table_earnings WHERE status = 'paid'"
    );
    $stats['total_paid_earnings'] = $stats['total_paid_earnings'] ? floatval($stats['total_paid_earnings']) : 0;
    
    return $stats;
}

/**
 * Add admin menu pages
 */
function ns_add_admin_menu() {
    add_menu_page(
        'Narayane Sena',
        'Narayane Sena',
        'manage_options',
        'narayane-sena',
        'ns_admin_dashboard_page',
        'dashicons-groups',
        30
    );
    
    add_submenu_page(
        'narayane-sena',
        'Dashboard',
        'Dashboard',
        'manage_options',
        'narayane-sena',
        'ns_admin_dashboard_page'
    );
    
    add_submenu_page(
        'narayane-sena',
        'Memberships',
        'Memberships',
        'manage_options',
        'ns-memberships',
        'ns_admin_memberships_page'
    );
    
    add_submenu_page(
        'narayane-sena',
        'Earnings',
        'Earnings',
        'manage_options',
        'ns-earnings',
        'ns_admin_earnings_page'
    );
}
add_action('admin_menu', 'ns_add_admin_menu');

/**
 * Admin dashboard page
 */
function ns_admin_dashboard_page() {
    $stats = ns_get_platform_stats();
    ?>
    <div class="wrap">
        <h1>Narayane Sena Dashboard</h1>
        <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
            <div class="stat-card">
                <h3>Total Users</h3>
                <p style="font-size: 32px; font-weight: bold;"><?php echo $stats['total_users']; ?></p>
            </div>
            <div class="stat-card">
                <h3>Active Memberships</h3>
                <p style="font-size: 32px; font-weight: bold;"><?php echo $stats['active_memberships']; ?></p>
            </div>
            <div class="stat-card">
                <h3>Total Revenue</h3>
                <p style="font-size: 32px; font-weight: bold;"><?php echo ns_format_currency($stats['total_revenue']); ?></p>
            </div>
        </div>
    </div>
    <?php
}

/**
 * Admin memberships page
 */
function ns_admin_memberships_page() {
    $memberships = ns_get_all_memberships();
    ?>
    <div class="wrap">
        <h1>Memberships</h1>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($memberships as $membership): ?>
                <tr>
                    <td><?php echo $membership->id; ?></td>
                    <td><?php echo $membership->display_name; ?></td>
                    <td><?php echo ns_format_currency($membership->amount); ?></td>
                    <td><?php echo ns_get_membership_badge($membership->status); ?></td>
                    <td><?php echo date('Y-m-d H:i', strtotime($membership->created_at)); ?></td>
                    <td>
                        <?php if ($membership->status === 'pending'): ?>
                            <button class="button button-primary" onclick="approveMembership(<?php echo $membership->id; ?>)">Approve</button>
                            <button class="button button-secondary" onclick="rejectMembership(<?php echo $membership->id; ?>)">Reject</button>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php
}

/**
 * Admin earnings page
 */
function ns_admin_earnings_page() {
    $earnings = ns_get_all_earnings();
    ?>
    <div class="wrap">
        <h1>Earnings</h1>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Referred User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($earnings as $earning): ?>
                <tr>
                    <td><?php echo $earning->id; ?></td>
                    <td><?php echo $earning->user_name; ?></td>
                    <td><?php echo $earning->referred_user_name; ?></td>
                    <td><?php echo ns_format_currency($earning->amount); ?></td>
                    <td><?php echo ns_get_earnings_badge($earning->status); ?></td>
                    <td><?php echo date('Y-m-d H:i', strtotime($earning->created_at)); ?></td>
                    <td>
                        <?php if ($earning->status === 'pending'): ?>
                            <button class="button button-primary" onclick="markEarningPaid(<?php echo $earning->id; ?>)">Mark Paid</button>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php
}
