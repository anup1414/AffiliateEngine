<?php
/**
 * Template Name: User Dashboard
 */

// Check if user is logged in
if (!is_user_logged_in()) {
    wp_redirect(home_url('/login/'));
    exit;
}

$user = wp_get_current_user();
$user_id = $user->ID;

// Check if user is approved
$status = get_user_meta($user_id, 'ns_status', true);
$membership_status = get_user_meta($user_id, 'ns_membership_status', true);
$referral_code = get_user_meta($user_id, 'ns_referral_code', true);

// Get earnings
global $wpdb;
$earnings_table = $wpdb->prefix . 'ns_earnings';
$memberships_table = $wpdb->prefix . 'ns_memberships';

$total_earnings = $wpdb->get_var($wpdb->prepare(
    "SELECT COALESCE(SUM(amount), 0) FROM $earnings_table WHERE user_id = %d AND status = 'approved'",
    $user_id
));

$today_earnings = $wpdb->get_var($wpdb->prepare(
    "SELECT COALESCE(SUM(amount), 0) FROM $earnings_table 
    WHERE user_id = %d AND status = 'approved' AND DATE(created_at) = CURDATE()",
    $user_id
));

$week_earnings = $wpdb->get_var($wpdb->prepare(
    "SELECT COALESCE(SUM(amount), 0) FROM $earnings_table 
    WHERE user_id = %d AND status = 'approved' AND YEARWEEK(created_at) = YEARWEEK(NOW())",
    $user_id
));

$total_referrals = $wpdb->get_var($wpdb->prepare(
    "SELECT COUNT(*) FROM $earnings_table WHERE user_id = %d",
    $user_id
));

get_header(); ?>

<div class="container" style="margin-top: 30px;">
    <?php if ($status !== 'approved'): ?>
        <div class="alert alert-warning">
            <strong>Account Pending Approval</strong><br>
            Your account is waiting for admin approval. You will be notified once approved.
        </div>
    <?php endif; ?>

    <?php if ($membership_status !== 'active'): ?>
        <div class="alert alert-info">
            <strong>Membership Inactive</strong><br>
            Purchase a membership to start earning through referrals.
            <a href="<?php echo home_url('/membership-purchase/'); ?>" class="btn btn-primary" style="margin-left: 10px;">Purchase Membership</a>
        </div>
    <?php endif; ?>

    <!-- User Info Card -->
    <div class="card">
        <div class="card-header">Profile Information</div>
        <div style="padding: 20px;">
            <p><strong>Name:</strong> <?php echo esc_html($user->display_name); ?></p>
            <p><strong>Email:</strong> <?php echo esc_html($user->user_email); ?></p>
            <p><strong>Phone:</strong> <?php echo esc_html(get_user_meta($user_id, 'phone', true)); ?></p>
            <p><strong>Status:</strong> 
                <span class="badge badge-<?php echo $status === 'approved' ? 'success' : 'warning'; ?>">
                    <?php echo esc_html(ucfirst($status)); ?>
                </span>
            </p>
            <p><strong>Membership:</strong> 
                <span class="badge badge-<?php echo $membership_status === 'active' ? 'success' : 'warning'; ?>">
                    <?php echo esc_html(ucfirst($membership_status)); ?>
                </span>
            </p>
            <p><strong>Your Referral Code:</strong> <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 5px; font-size: 16px; font-weight: 600;"><?php echo esc_html($referral_code); ?></code></p>
            <p><strong>Referral Link:</strong></p>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 5px;">
                <input type="text" value="<?php echo home_url('/login/?ref=' . $referral_code); ?>" readonly class="form-control" id="referralLink" style="font-size: 14px;">
            </div>
            <button onclick="copyReferralLink()" class="btn btn-primary" style="margin-top: 10px;">Copy Referral Link</button>
        </div>
    </div>

    <!-- Earnings Dashboard -->
    <div style="margin-top: 30px;">
        <h2 style="margin-bottom: 20px;">Earnings Dashboard</h2>
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-value">₹<?php echo number_format($today_earnings, 0); ?></div>
                <div class="stat-label">Today's Earnings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">₹<?php echo number_format($week_earnings, 0); ?></div>
                <div class="stat-label">This Week</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">₹<?php echo number_format($total_earnings, 0); ?></div>
                <div class="stat-label">Total Earnings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value"><?php echo number_format($total_referrals, 0); ?></div>
                <div class="stat-label">Total Referrals</div>
            </div>
        </div>
    </div>

    <!-- Recent Referrals -->
    <div class="card" style="margin-top: 30px;">
        <div class="card-header">Recent Referrals</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Referred User</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $earnings = $wpdb->get_results($wpdb->prepare(
                    "SELECT * FROM $earnings_table WHERE user_id = %d ORDER BY created_at DESC LIMIT 10",
                    $user_id
                ));

                if (empty($earnings)):
                ?>
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 30px; color: #6c757d;">
                            No referrals yet. Share your referral link to start earning!
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($earnings as $earning): ?>
                        <?php $referred_user = get_userdata($earning->referred_user_id); ?>
                        <tr>
                            <td><?php echo date('M d, Y', strtotime($earning->created_at)); ?></td>
                            <td><?php echo $referred_user ? esc_html($referred_user->display_name) : 'N/A'; ?></td>
                            <td>₹<?php echo number_format($earning->amount, 0); ?></td>
                            <td>
                                <span class="badge badge-<?php echo $earning->status === 'approved' ? 'success' : 'warning'; ?>">
                                    <?php echo esc_html(ucfirst($earning->status)); ?>
                                </span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
function copyReferralLink() {
    const input = document.getElementById('referralLink');
    input.select();
    document.execCommand('copy');
    alert('Referral link copied to clipboard!');
}
</script>

<?php get_footer(); ?>
