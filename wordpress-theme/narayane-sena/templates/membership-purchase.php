<?php
/**
 * Template Name: Membership Purchase
 */

// Check if user is logged in
if (!is_user_logged_in()) {
    wp_redirect(home_url('/login/'));
    exit;
}

$user = wp_get_current_user();
$user_id = $user->ID;

// Check if user already has active membership
$membership = ns_get_user_membership($user_id);
if ($membership && $membership->status === 'active') {
    wp_redirect(home_url('/user-dashboard/'));
    exit;
}

// Get active QR code
$qr_code = ns_get_active_qr_code();

get_header(); ?>

<div class="container" style="max-width: 800px; margin-top: 50px;">
    <div class="card">
        <div class="card-header" style="text-align: center;">
            <h2 style="margin: 0;">Purchase Membership</h2>
            <p style="margin: 10px 0 0; color: #6c757d;">Join Narayane Sena and Start Earning</p>
        </div>

        <?php if ($membership && $membership->status === 'pending'): ?>
            <div class="alert alert-info">
                <strong>Membership Under Review</strong><br>
                Your membership purchase is pending admin approval. We'll notify you once it's approved.
            </div>
            <div style="margin-top: 20px;">
                <p><strong>Amount Paid:</strong> <?php echo ns_format_currency($membership->amount); ?></p>
                <p><strong>Submitted On:</strong> <?php echo date('d M Y, h:i A', strtotime($membership->created_at)); ?></p>
                <?php if ($membership->payment_qr_image): ?>
                <p><strong>Payment Screenshot:</strong></p>
                <img src="<?php echo esc_url($membership->payment_qr_image); ?>" style="max-width: 300px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <?php endif; ?>
            </div>
        <?php elseif ($membership && $membership->status === 'rejected'): ?>
            <div class="alert alert-danger">
                <strong>Membership Rejected</strong><br>
                Your previous membership application was rejected. Please try again with correct payment details.
            </div>
            <?php include 'membership-form.php'; ?>
        <?php else: ?>
            <!-- Membership Plans -->
            <div style="margin-bottom: 30px;">
                <h3 style="text-align: center; margin-bottom: 20px;">Membership Plans</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <!-- Regular Plan -->
                    <div class="card" style="text-align: center; padding: 30px;">
                        <h4>Regular Plan</h4>
                        <div class="stat-value" style="margin: 20px 0;">₹5,000</div>
                        <p style="color: #6c757d;">Standard membership with all benefits</p>
                    </div>
                    
                    <!-- Discounted Plan -->
                    <div class="card" style="text-align: center; padding: 30px; border: 2px solid var(--primary-color);">
                        <div class="badge badge-success" style="margin-bottom: 10px;">Best Value</div>
                        <h4>Save ₹3000</h4>
                        <div class="stat-value" style="margin: 20px 0;">₹2,000</div>
                        <p style="color: #6c757d;">Use coupon code: <strong>SAVE3K</strong></p>
                    </div>
                </div>
            </div>

            <!-- Membership Benefits -->
            <div class="alert alert-info">
                <h4 style="margin-top: 0;">Membership Benefits:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Earn ₹2,000 for each successful referral</li>
                    <li>Unlimited earning potential</li>
                    <li>24/7 support</li>
                    <li>Instant withdrawal processing</li>
                </ul>
            </div>

            <!-- Payment Form -->
            <form id="membershipForm" method="post" enctype="multipart/form-data">
                <div class="form-group">
                    <label class="form-label">Coupon Code (Optional)</label>
                    <input type="text" name="coupon_code" id="couponCode" class="form-control" placeholder="Enter SAVE3K to save ₹3000">
                    <small style="color: #6c757d;">Enter SAVE3K to get membership for just ₹2,000</small>
                </div>

                <div id="priceDisplay" class="alert alert-success" style="font-size: 18px; font-weight: 600; text-align: center;">
                    Amount to Pay: ₹5,000
                </div>

                <!-- Payment QR Code -->
                <?php if ($qr_code): ?>
                <div style="text-align: center; margin: 30px 0;">
                    <h4>Scan QR Code to Pay</h4>
                    <img src="<?php echo esc_url($qr_code->qr_image); ?>" alt="Payment QR" style="max-width: 300px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <?php if ($qr_code->upi_id): ?>
                    <p style="color: #6c757d;">UPI ID: <strong><?php echo esc_html($qr_code->upi_id); ?></strong></p>
                    <?php endif; ?>
                </div>
                <?php else: ?>
                <div class="alert alert-warning">
                    Payment QR code not available. Please contact admin.
                </div>
                <?php endif; ?>

                <div class="form-group">
                    <label class="form-label">Upload Payment Screenshot *</label>
                    <input type="file" name="payment_screenshot" id="paymentScreenshot" class="form-control" accept="image/*" required>
                    <small style="color: #6c757d;">Upload a clear screenshot of your payment confirmation</small>
                </div>

                <div id="responseMessage"></div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 15px; font-size: 18px;">
                    Submit Membership Request
                </button>
            </form>
        <?php endif; ?>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Update price based on coupon code
    $('#couponCode').on('input', function() {
        const coupon = $(this).val().toUpperCase();
        let price = 5000;
        
        if (coupon === 'SAVE3K') {
            price = 2000;
            $('#priceDisplay').html('Amount to Pay: ₹2,000 <small style="color: #155724;">(₹3,000 discount applied!)</small>');
        } else {
            $('#priceDisplay').html('Amount to Pay: ₹5,000');
        }
    });
    
    // Handle form submission
    $('#membershipForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        formData.append('action', 'ns_purchase_membership');
        formData.append('nonce', nsAjax.nonce);
        
        $('#responseMessage').html('<div class="alert alert-info">Processing your request...</div>');
        
        $.ajax({
            url: nsAjax.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    $('#responseMessage').html('<div class="alert alert-success">' + response.data.message + '</div>');
                    setTimeout(function() {
                        window.location.href = '<?php echo home_url('/user-dashboard/'); ?>';
                    }, 2000);
                } else {
                    $('#responseMessage').html('<div class="alert alert-danger">' + response.data.message + '</div>');
                }
            },
            error: function() {
                $('#responseMessage').html('<div class="alert alert-danger">An error occurred. Please try again.</div>');
            }
        });
    });
});
</script>

<?php get_footer(); ?>
