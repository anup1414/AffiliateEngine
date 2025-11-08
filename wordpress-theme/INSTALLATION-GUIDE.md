# Narayane Sena WordPress Theme - Installation Guide

## Theme Files Location
Your complete WordPress theme is located in: `wordpress-theme/narayane-sena/`

## Installation Steps for Hostinger WordPress

### Option 1: Direct Upload (Recommended)

1. **Download the Theme Folder**
   - Download the entire `narayane-sena` folder from this project
   - Compress it as a ZIP file on your local computer:
     - **Windows**: Right-click the folder → Send to → Compressed (zipped) folder
     - **Mac**: Right-click the folder → Compress "narayane-sena"
     - **Linux**: `cd wordpress-theme && zip -r narayane-sena.zip narayane-sena/`

2. **Upload to WordPress**
   - Log in to your WordPress admin panel (yoursite.com/wp-admin)
   - Go to: Appearance → Themes → Add New → Upload Theme
   - Click "Choose File" and select your `narayane-sena.zip` file
   - Click "Install Now"
   - Wait for the upload to complete
   - Click "Activate"

### Option 2: FTP/File Manager Upload

1. **Using Hostinger File Manager**
   - Log in to Hostinger control panel
   - Open File Manager
   - Navigate to: `public_html/wp-content/themes/`
   - Upload the `narayane-sena` folder (unzipped)
   - Go to WordPress admin → Appearance → Themes
   - Find "Narayane Sena" and click "Activate"

## Important: After Installation

### 1. Database Tables
The theme will automatically create necessary database tables:
- `wp_ns_memberships` - Stores membership data
- `wp_ns_earnings` - Stores referral earnings
- `wp_ns_payment_qr_codes` - Stores payment QR codes

### 2. Admin Account Setup
**IMPORTANT**: You need to use your existing WordPress admin account to manage the platform.

If you're setting up a fresh WordPress installation:
1. During WordPress installation, create your admin account
2. Use that account to log in to WordPress admin
3. Activate the Narayane Sena theme
4. The theme will add admin functionality to your account

**Security Note**: This theme does NOT create any default admin accounts. You must use WordPress's built-in admin account management.

### 3. Default Pages Created
The theme automatically creates these pages:
- Login/Register
- User Dashboard
- Admin Dashboard
- Membership Purchase

### 4. Upload Payment QR Code
1. Log in as admin
2. Go to WordPress admin panel
3. Navigate to "Narayane Sena" menu
4. Upload your payment QR code image
5. Add UPI ID (optional but recommended)

## Theme Configuration

### Membership Prices
Default prices are set in `functions.php`:
- Regular membership: ₹5,000
- With SAVE3K coupon: ₹2,000

To change prices, edit the `ns_get_membership_price()` function in `functions.php`

### Referral Earnings
Default: ₹2,000 per successful referral

To change, edit the `ns_get_referral_amount()` function in `functions.php`

## Features Included

### User Features
- Registration with referral code support
- Profile management
- Membership purchase with QR payment
- Referral tracking and earnings
- Personal dashboard

### Admin Features
- User management
- Membership approval/rejection
- Earnings management
- Payment verification
- Platform statistics
- QR code management

## Customization

### Theme Colors
Edit `style.css` to change colors. Main color variables:
```css
--primary-color: hsl(142, 76%, 36%);
--secondary-color: #f8f9fa;
--text-dark: #212529;
```

### Theme Name/Description
Edit the header comment in `style.css`:
```css
/*
Theme Name: Narayane Sena
Description: Your custom description
Version: 1.0.0
*/
```

## Troubleshooting

### Theme Not Showing
- Check folder name is `narayane-sena` (lowercase, with hyphen)
- Ensure all files are present
- Check file permissions (755 for folders, 644 for files)

### Database Tables Not Created
- Deactivate and reactivate the theme
- Check WordPress error logs
- Ensure database connection is working

### Payment QR Not Showing
- Upload a QR code via admin panel
- Check the file uploaded successfully
- Verify file is a valid image format

### Users Can't Register
- Check if WordPress registration is enabled
- Settings → General → "Anyone can register"
- Or users can register through the theme's custom registration

## Support Files Included

- `README.txt` - Theme information for WordPress.org
- `style.css` - Main stylesheet with theme header
- `functions.php` - Theme functionality
- `index.php` - Main template
- `header.php` / `footer.php` - Header and footer templates
- `page.php` / `single.php` - Page and post templates
- `templates/` - Custom page templates
- `inc/` - Include files (functions, AJAX handlers, admin)
- `assets/js/main.js` - JavaScript functionality

## Need Help?

Contact the Narayane Sena team for:
- Custom modifications
- Feature additions
- Technical support
- Installation assistance

## Version Information

- **Theme Version**: 1.0.0
- **WordPress Requirement**: 5.0+
- **PHP Requirement**: 7.4+
- **Tested With**: WordPress 6.4

---

**Ready to Upload!** Follow the steps above to install your theme on Hostinger.
