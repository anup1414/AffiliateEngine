/**
 * Main JavaScript file for Narayane Sena theme
 */

jQuery(document).ready(function($) {
    console.log('Narayane Sena theme loaded');
    
    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        $('.alert').fadeOut();
    }, 5000);
});

/**
 * Admin functions
 */
function approveMembership(membershipId) {
    if (!confirm('Are you sure you want to approve this membership?')) {
        return;
    }
    
    jQuery.post(nsAjax.ajaxurl, {
        action: 'ns_approve_membership',
        nonce: nsAjax.nonce,
        membership_id: membershipId
    }, function(response) {
        if (response.success) {
            alert(response.data.message);
            location.reload();
        } else {
            alert(response.data.message);
        }
    });
}

function rejectMembership(membershipId) {
    if (!confirm('Are you sure you want to reject this membership?')) {
        return;
    }
    
    jQuery.post(nsAjax.ajaxurl, {
        action: 'ns_reject_membership',
        nonce: nsAjax.nonce,
        membership_id: membershipId
    }, function(response) {
        if (response.success) {
            alert(response.data.message);
            location.reload();
        } else {
            alert(response.data.message);
        }
    });
}

function markEarningPaid(earningId) {
    if (!confirm('Are you sure you want to mark this earning as paid?')) {
        return;
    }
    
    jQuery.post(nsAjax.ajaxurl, {
        action: 'ns_mark_earning_paid',
        nonce: nsAjax.nonce,
        earning_id: earningId
    }, function(response) {
        if (response.success) {
            alert(response.data.message);
            location.reload();
        } else {
            alert(response.data.message);
        }
    });
}
