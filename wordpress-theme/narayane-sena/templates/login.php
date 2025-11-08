<?php
/**
 * Template Name: Login/Register
 */

// Redirect if already logged in
if (is_user_logged_in()) {
    $user = wp_get_current_user();
    $is_admin = in_array('administrator', $user->roles) || get_user_meta($user->ID, 'ns_is_admin', true);
    if ($is_admin) {
        wp_redirect(home_url('/admin-dashboard/'));
    } else {
        wp_redirect(home_url('/user-dashboard/'));
    }
    exit;
}

get_header(); ?>

<div class="container" style="max-width: 500px; margin-top: 50px;">
    <div class="card">
        <div class="card-header" style="text-align: center;">
            <h2 style="margin: 0;">Narayane Sena</h2>
            <p style="margin: 10px 0 0; color: #6c757d; font-size: 14px;">Login or Register to Continue</p>
        </div>

        <!-- Tab Navigation -->
        <div style="display: flex; margin-bottom: 20px; border-bottom: 2px solid #dee2e6;">
            <button onclick="showTab('login')" id="loginTab" class="btn btn-secondary" style="flex: 1; border-radius: 0; border-bottom: 3px solid var(--primary-color);">
                Login
            </button>
            <button onclick="showTab('register')" id="registerTab" class="btn btn-secondary" style="flex: 1; border-radius: 0;">
                Register
            </button>
        </div>

        <!-- Login Form -->
        <div id="loginForm">
            <?php
            if (isset($_GET['login']) && $_GET['login'] == 'failed') {
                echo '<div class="alert alert-danger">Invalid username or password!</div>';
            }
            if (isset($_GET['registration']) && $_GET['registration'] == 'success') {
                echo '<div class="alert alert-success">Registration successful! Please wait for admin approval before logging in.</div>';
            }
            ?>
            
            <form method="post" action="<?php echo esc_url(site_url('/wp-login.php', 'login_post')); ?>">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" name="log" class="form-control" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" name="pwd" class="form-control" required>
                </div>

                <div class="form-group" style="display: flex; align-items: center;">
                    <input type="checkbox" name="rememberme" value="forever" id="rememberme" style="width: auto; margin-right: 10px;">
                    <label for="rememberme" style="margin: 0;">Remember Me</label>
                </div>

                <input type="hidden" name="redirect_to" value="<?php echo home_url(); ?>">
                
                <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
            </form>
        </div>

        <!-- Register Form -->
        <div id="registerForm" style="display: none;">
            <form method="post" id="nsRegisterForm">
                <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <input type="text" name="full_name" class="form-control" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Username *</label>
                    <input type="text" name="username" class="form-control" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" name="email" class="form-control" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Phone Number *</label>
                    <input type="tel" name="phone" class="form-control" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Password *</label>
                    <input type="password" name="password" class="form-control" required minlength="6">
                </div>

                <div class="form-group">
                    <label class="form-label">Confirm Password *</label>
                    <input type="password" name="confirm_password" class="form-control" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Referral Code (Optional)</label>
                    <input type="text" name="referral_code" class="form-control" value="<?php echo isset($_GET['ref']) ? esc_attr($_GET['ref']) : ''; ?>">
                </div>

                <div id="registerMessage"></div>

                <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
            </form>
        </div>
    </div>
</div>

<script>
function showTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginTab.style.borderBottom = '3px solid var(--primary-color)';
        registerTab.style.borderBottom = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerTab.style.borderBottom = '3px solid var(--primary-color)';
        loginTab.style.borderBottom = 'none';
    }
}

// Handle registration form
jQuery(document).ready(function($) {
    $('#nsRegisterForm').on('submit', function(e) {
        e.preventDefault();

        const password = $('[name="password"]').val();
        const confirmPassword = $('[name="confirm_password"]').val();

        if (password !== confirmPassword) {
            $('#registerMessage').html('<div class="alert alert-danger">Passwords do not match!</div>');
            return;
        }

        const formData = {
            action: 'ns_register_user',
            nonce: nsAjax.nonce,
            full_name: $('[name="full_name"]').val(),
            username: $('[name="username"]').val(),
            email: $('[name="email"]').val(),
            phone: $('[name="phone"]').val(),
            password: password,
            referral_code: $('[name="referral_code"]').val()
        };

        $.post(nsAjax.ajaxurl, formData, function(response) {
            if (response.success) {
                window.location.href = '<?php echo home_url('/login/'); ?>?registration=success';
            } else {
                $('#registerMessage').html('<div class="alert alert-danger">' + response.data.message + '</div>');
            }
        });
    });
});
</script>

<?php get_footer(); ?>
