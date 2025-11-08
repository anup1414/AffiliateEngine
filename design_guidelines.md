# Design Guidelines: Affiliate Marketing Platform

## Design Approach

**Selected Approach:** Design System (Dashboard-Focused)

**Primary References:** Stripe Dashboard, Linear, Vercel Dashboard

**Rationale:** This is a data-intensive application requiring clarity, efficiency, and trust. Users need to quickly parse earnings data, manage memberships, and track referrals. A clean, professional dashboard aesthetic prioritizes function over decoration.

## Core Design Elements

### Typography

**Font Family:** Inter (primary), Roboto Mono (numerical data)

**Hierarchy:**
- Page Titles: text-3xl font-bold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Data Labels: text-sm font-medium text-gray-600
- Numerical Data: text-2xl font-mono font-semibold (earnings)
- Small Labels/Meta: text-xs font-medium

### Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16

**Container Structure:**
- Dashboard Shell: Full-height layout with fixed sidebar (w-64) and scrollable main content
- Content Padding: p-6 to p-8 for main areas
- Card Spacing: gap-6 between cards
- Section Margins: mb-8 between major sections

**Grid Patterns:**
- Stats Overview: grid-cols-1 md:grid-cols-3 gap-6
- User List/Tables: Full-width with responsive scrolling
- Form Layouts: max-w-2xl for input forms

## Component Library

### Navigation

**Sidebar (User & Admin):**
- Fixed left sidebar with logo at top
- Vertical nav items with icons (Heroicons)
- Active state: subtle background highlight
- Sections: Dashboard, Profile, Earnings, Referrals (user) / Users, Payments, Analytics (admin)

**Top Bar:**
- User avatar and name (right-aligned)
- Logout button
- No extensive top navigation needed

### Dashboard Components

**Stats Cards:**
- White background with subtle border
- Large numerical value (earnings) with label above
- Icon in top-right corner
- Trend indicator if applicable (arrows for growth)
- p-6 padding, rounded-lg

**Earnings Display:**
- Three-card layout: Daily | 7-Day | Lifetime
- Each card shows: ₹ amount in large mono font
- Small text below with period label
- Subtle gradient or accent border on lifetime card

**Membership Card:**
- Current status badge (Active/Pending/Expired)
- Purchase date and expiry date
- Membership tier display
- Referral link with copy button

**Referral Link Section:**
- Input field with generated link (read-only)
- Copy button integrated into input (right side)
- Share count or referral stats below
- Clear "Share Your Link" heading

### Data Tables

**User List (Admin):**
- Clean table with alternating row backgrounds
- Columns: Name, Email, Join Date, Status, Earnings, Actions
- Action buttons: icon-only (view, edit, delete)
- Pagination at bottom
- Search bar above table

**Transaction History:**
- List/table format with date, description, amount
- Color coding for earnings (green accent on amount)
- Filter by date range

### Forms

**Profile Form:**
- Two-column layout on desktop, single on mobile
- Input fields: Full Name, Email, Phone, Address
- Profile picture upload: circular preview with upload button below
- Consistent input styling: border-gray-300, rounded-md, p-3
- Labels above inputs: text-sm font-medium mb-2

**Membership Purchase Flow:**
- Step indicator at top (Payment → Details → Complete)
- Membership price display: strikethrough original price when coupon applied
- Coupon input field with "Apply" button
- QR code display in centered card
- Payment confirmation checkbox

**Payment QR Upload (Admin):**
- Drag-and-drop zone with preview
- Current QR preview if exists
- Replace/Update button

### Status Elements

**Badges:**
- Pill-shaped with appropriate semantic meaning
- px-3 py-1 rounded-full text-sm
- Active: green accent
- Pending: yellow accent  
- Expired: red accent

**Empty States:**
- Centered content with icon
- Descriptive text explaining the empty state
- Call-to-action button where applicable

## Animations

Use sparingly:
- Fade-in on page transitions (200ms)
- Hover lift on cards (subtle transform)
- Loading spinners for async actions
- Success checkmark animation on actions

## Images

**Profile Pictures:**
- Circular avatars throughout
- Default avatar icon for users without uploads
- Multiple sizes: small (32px), medium (64px), large (128px)

**QR Codes:**
- Centered display in white card
- max-w-xs container
- Clear border separation

**No Hero Images:** This is a dashboard application - no marketing hero needed

## Accessibility

- All form inputs have associated labels
- Icon buttons include aria-labels
- Tables include proper header structure
- Color is not the only indicator of status (use icons + text)
- Keyboard navigation support throughout
- Focus states visible on all interactive elements