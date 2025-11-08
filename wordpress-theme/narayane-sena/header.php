<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <div class="header">
        <div class="container">
            <h1><?php bloginfo('name'); ?></h1>
            <p style="margin: 5px 0; opacity: 0.9;"><?php bloginfo('description'); ?></p>
            
            <?php if (is_user_logged_in()): ?>
                <nav>
                    <ul class="nav-menu">
                        <?php
                        $user = wp_get_current_user();
                        $is_admin = in_array('administrator', $user->roles) || get_user_meta($user->ID, 'ns_is_admin', true);
                        
                        if ($is_admin):
                        ?>
                            <li><a href="<?php echo home_url('/admin-dashboard/'); ?>">Admin Dashboard</a></li>
                        <?php else: ?>
                            <li><a href="<?php echo home_url('/user-dashboard/'); ?>">Dashboard</a></li>
                            <li><a href="<?php echo home_url('/membership-purchase/'); ?>">Purchase Membership</a></li>
                        <?php endif; ?>
                        <li><a href="<?php echo wp_logout_url(home_url()); ?>">Logout</a></li>
                    </ul>
                </nav>
            <?php endif; ?>
        </div>
    </div>
