<?php
/**
 * Template Name: Admin Dashboard
 */

// Check if user is admin
if (!is_user_logged_in()) {
    wp_redirect(home_url('/login/'));
    exit;
}

$user = wp_get_current_user();
$is_admin = in_array('administrator', $user->roles) || get_user_meta($user->ID, 'ns_is_admin', true);

if (!$is_admin) {
    wp_redirect(home_url('/user-dashboard/'));
    exit;
}

// Get statistics
$stats = ns_get_platform_stats();
$pending_memberships = ns_get_pending_memberships();
$pending_earnings = ns_get_pending_earnings();

get_header(); ?>

<div class="container" style="margin-top: 30px;">
    <h2>Admin Dashboard</h2>
    
    <!-- Stats Grid -->
    <div class="dashboard-grid">
        <div class="stat-card">
            <div class="stat-value"><?php echo $stats['total_users']; ?></div>
            <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
            <div class="stat-value"><?php echo $stats['active_memberships']; ?></div>
            <div class="stat-label">Active Memberships</div>
        </div>
        <div class="stat-card">
            <div class="stat-value"><?php echo $stats['pending_memberships']; ?></div>
            <div class="stat-label">Pending Memberships</div>
        </div>
        <div class="stat-card">
            <div class="stat-value"><?php echo ns_format_currency($stats['total_revenue']); ?></div>
            <div class="stat-label">Total Revenue</div>
        </div>
    </div>

    <!-- Pending Memberships -->
    <div class="card" style="margin-top: 30px;">
        <div class="card-header">Pending Membership Approvals</div>
        <?php if (count($pending_memberships) > 0): ?>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Amount</th>
                        <th>Coupon</th>
                        <th>Date</th>
                        <th>Payment Screenshot</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($pending_memberships as $membership): ?>
                    <tr>
                        <td><?php echo $membership->id; ?></td>
                        <td><?php echo esc_html($membership->display_name); ?></td>
                        <td><?php echo esc_html($membership->user_email); ?></td>
                        <td><?php echo ns_format_currency($membership->amount); ?></td>
                        <td><?php echo $membership->coupon_code ? esc_html($membership->coupon_code) : 'None'; ?></td>
                        <td><?php echo date('d M Y', strtotime($membership->created_at)); ?></td>
                        <td>
                            <?php if ($membership->payment_qr_image): ?>
                                <a href="<?php echo esc_url($membership->payment_qr_image); ?>" target="_blank" class="btn btn-secondary">View</a>
                            <?php else: ?>
                                N/A
                            <?php endif; ?>
                        </td>
                        <td>
                            <button class="btn btn-success" onclick="approveMembership(<?php echo $membership->id; ?>)">Approve</button>
                            <button class="btn btn-danger" onclick="rejectMembership(<?php echo $membership->id; ?>)">Reject</button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p style="color: #6c757d; text-align: center; padding: 30px;">No pending memberships</p>
        <?php endif; ?>
    </div>

    <!-- Pending Earnings -->
    <div class="card" style="margin-top: 30px;">
        <div class="card-header">Pending Earnings Payments</div>
        <?php if (count($pending_earnings) > 0): ?>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Referred User</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($pending_earnings as $earning): ?>
                    <tr>
                        <td><?php echo $earning->id; ?></td>
                        <td><?php echo esc_html($earning->user_name); ?></td>
                        <td><?php echo esc_html($earning->referred_user_name); ?></td>
                        <td><?php echo ns_format_currency($earning->amount); ?></td>
                        <td><?php echo date('d M Y', strtotime($earning->created_at)); ?></td>
                        <td>
                            <button class="btn btn-success" onclick="markEarningPaid(<?php echo $earning->id; ?>)">Mark Paid</button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p style="color: #6c757d; text-align: center; padding: 30px;">No pending earnings</p>
        <?php endif; ?>
    </div>

    <!-- All Users -->
    <div class="card" style="margin-top: 30px;">
        <div class="card-header">All Users</div>
        <?php
        $all_users = ns_get_all_users();
        if (count($all_users) > 0):
        ?>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Referral Code</th>
                        <th>Status</th>
                        <th>Membership</th>
                        <th>Registered</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($all_users as $u): ?>
                    <tr>
                        <td><?php echo $u->ID; ?></td>
                        <td><?php echo esc_html($u->display_name); ?></td>
                        <td><?php echo esc_html($u->user_email); ?></td>
                        <td><?php echo esc_html(ns_get_user_referral_code($u->ID)); ?></td>
                        <td>
                            <?php
                            $user_status = get_user_meta($u->ID, 'ns_status', true);
                            $badge_class = $user_status === 'approved' ? 'success' : 'warning';
                            ?>
                            <span class="badge badge-<?php echo $badge_class; ?>"><?php echo ucfirst($user_status); ?></span>
                        </td>
                        <td>
                            <?php
                            $membership_status = get_user_meta($u->ID, 'ns_membership_status', true);
                            $badge_class = $membership_status === 'active' ? 'success' : 'danger';
                            ?>
                            <span class="badge badge-<?php echo $badge_class; ?>"><?php echo ucfirst($membership_status); ?></span>
                        </td>
                        <td><?php echo date('d M Y', strtotime($u->user_registered)); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p style="color: #6c757d; text-align: center; padding: 30px;">No users found</p>
        <?php endif; ?>
    </div>
</div>

<?php get_footer(); ?>
