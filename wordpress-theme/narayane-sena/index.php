<?php
/**
 * The main template file
 *
 * @package Narayane_Sena
 */

get_header(); ?>

<div class="container">
    <div class="card" style="margin-top: 50px; text-align: center; padding: 40px;">
        <h1>Welcome to Narayane Sena</h1>
        <p style="font-size: 18px; margin: 20px 0;">Professional Membership & Referral Management Platform</p>
        
        <?php if (is_user_logged_in()): ?>
            <?php
            $user = wp_get_current_user();
            $is_admin = in_array('administrator', $user->roles) || get_user_meta($user->ID, 'ns_is_admin', true);
            ?>
            <p>Welcome back, <?php echo esc_html($user->display_name); ?>!</p>
            <div style="margin-top: 20px;">
                <?php if ($is_admin): ?>
                    <a href="<?php echo home_url('/admin-dashboard/'); ?>" class="btn btn-primary">Go to Admin Dashboard</a>
                <?php else: ?>
                    <a href="<?php echo home_url('/user-dashboard/'); ?>" class="btn btn-primary">Go to Dashboard</a>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <p>Please login to access your dashboard</p>
            <div style="margin-top: 20px;">
                <a href="<?php echo home_url('/login/'); ?>" class="btn btn-primary">Login / Register</a>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php get_footer(); ?>
