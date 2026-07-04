You are a world-class senior UI/UX designer, senior frontend architect, product designer, and enterprise healthcare SaaS designer.

Redesign the entire Rapid Corona Test Booking Platform from the provided repository. The redesign must cover both the public booking app and the admin/operations app. The result must look modern, beautiful, professional, enterprise-grade, clean, trustworthy, medical/healthcare-oriented, and production-ready.

The frontend stack will be:

* React
* TypeScript
* Tailwind CSS
* Biome
* Storybook
* flux-store for frontend state management
* Component-driven architecture
* Feature-based folder structure
* Reusable design system components
* Responsive desktop/tablet/mobile layouts

Do not create a generic COVID landing page. This is a real operational booking and test-center administration platform. Every screen, flow, state, and component must reflect the real product behavior.

Product context:

Rapid Corona Test is a platform for test centers to manage rapid antigen/PCR test appointment bookings, check-ins, test result workflows, result certificates, QR codes, email notifications, Corona-Warn-App transmission, agents, settings, statistics, and daily operations.

The product has two main surfaces:

1. Public booking app for customers/patients.
2. Admin app for test-center operators and agents.

Design goals:

* Modern healthcare SaaS look.
* Enterprise-grade visual quality.
* Beautiful, polished, and trustworthy.
* Fast operational UX for admins.
* Simple mobile-first booking UX for customers.
* Strong status clarity for appointments and results.
* Fully responsive design.
* Accessible, WCAG-friendly contrast and spacing.
* Clean component system that can be implemented with React, TypeScript, Tailwind CSS, Storybook, Biome, and flux-store.
* Avoid old Material UI/Bootstrap-looking design.
* Avoid cluttered cards and weak spacing.
* Use a coherent design system.

Preferred visual direction:

Use a premium healthcare SaaS theme:

* Background: #F6F8FC, #FFFFFF, subtle blue/violet gradients.
* Primary: deep medical blue / indigo, e.g. #355CFF or #4F46E5.
* Secondary: teal/green healthcare accent, e.g. #10B981.
* Sidebar/Admin dark navy: #081827 / #0F172A.
* Success: green.
* Warning: amber.
* Danger/positive result: red.
* Neutral: slate/gray scale.
* Cards: rounded 16–24px, soft borders, subtle shadows, strong whitespace.
* Typography: Inter, Manrope, or similar modern sans-serif.
* Icons: clean outline icons.
* Data views: compact, readable, dashboard-grade.
* Forms: elegant labels, validation states, helper text, grouped sections.

Create a full Figma design system first:

Design system pages:

1. Design Tokens

   * Colors
   * Typography
   * Spacing
   * Radius
   * Shadows
   * Breakpoints
   * Status colors
   * Result colors
   * Appointment status colors

2. Components

   * Button: primary, secondary, ghost, destructive, success, warning, loading, disabled
   * Icon button
   * Input
   * Select
   * Date picker
   * Time picker
   * Date range picker
   * Checkbox
   * Radio
   * Search input
   * Upload field
   * Status badge
   * Result badge
   * Appointment card
   * Patient/person card
   * Test type card
   * Time slot card
   * QR code card
   * Empty state
   * Error state
   * Loading skeleton
   * Toast notification
   * Modal/dialog
   * Drawer
   * Tabs
   * Sidebar nav
   * Top bar
   * Breadcrumb
   * Stepper
   * Data table
   * Chart card
   * KPI card
   * Settings section card
   * Timeline/activity item
   * Confirmation summary
   * Print/download action component

3. Layouts

   * Public mobile layout
   * Public desktop layout
   * Admin desktop shell
   * Admin tablet shell
   * Admin responsive mobile fallback
   * Modal/drawer layout
   * Form layout
   * Dashboard grid layout

Public booking app flows to design:

A. Public home screen

Current route: `/`

Purpose:

* Introduce the test center.
* Show center name, address, contact context.
* Let user start a new registration.
* Let returning users request their registration/rebooking link by email.

Required UI:

* Test center logo/name.
* Hero card: “Book your test in a few steps”.
* Primary CTA: “Book appointment”.
* Secondary area: “Already registered?” with email input and “Send booking link”.
* Trust badges: secure data, fast appointment, QR confirmation, email confirmation.
* Mobile-first layout.
* Desktop version with hero + info card.

B. Booking registration flow

Current route: `/reservation/*`

Current steps:

1. `test-type`
2. `select-appointment`
3. `add-persons`

Create a redesigned stepper:

* Clear 3-step progress.
* Sticky top summary on mobile.
* Desktop side summary panel.
* Back/close controls.
* Show selected test type and appointment after selection.
* Prevent visual confusion between completed and active steps.

Step 1: Select test type

Design:

* Cards for available test types.
* Example types: Rapid antigen test, PCR test, combo test.
* Show label, price, expected duration, short description, badge for popular/default.
* Selected state.
* Continue button disabled until selected.
* Support inactive/unavailable test types.

Step 2: Select appointment

Design:

* Date selector/calendar strip.
* Available time slots grouped by morning/afternoon/evening.
* Slot capacity indicator if needed.
* Disabled full slots.
* Selected slot summary.
* Real-time update hint because the app uses WebSocket updates.
* Empty state if no slots available.
* Continue button disabled until appointment selected.

Step 3: Add persons

The repository supports multiple persons in one appointment.

Design:

* Add first person form.
* Add additional persons.
* Person cards with edit/remove.
* Fields:

  * First name
  * Last name
  * Birth date
  * CIN/ID optional
  * Email
  * Repeat email
  * Telephone
  * Address
  * Postal code
  * City
  * Country
* Validation states.
* Privacy/terms consent.
* Corona/test policy consent if required.
* Final booking summary:

  * Test type
  * Price
  * Appointment date/time
  * Number of persons
  * Center address
* Primary CTA: “Confirm booking”.
* Loading state while booking is submitted.

C. Booking done / confirmation screen

Current route: `/booking-done`

Design:

* Success confirmation.
* QR code card.
* Booking reference.
* Appointment date/time.
* Person summary.
* Message: confirmation email was sent.
* Actions:

  * Download QR / certificate info
  * Add to calendar
  * Book another appointment
  * Go home
* Mobile and desktop responsive layouts.
* Empty fallback if no booking state exists.

D. Booking cancellation flow

Current route: `/booking-cancel/:bookingData`

Design:

* Secure cancellation page.
* Show appointment summary.
* Show list of persons in booking.
* Checkbox selection for persons to cancel.
* Select all option.
* Cancel CTA with confirmation dialog.
* Success state after cancellation.
* Already-canceled person state.
* Error/expired link state.
* Clear warning that cancellation cannot be undone.

E. Requested persons / rebooking link flow

Current route: `/requested-persons/:persons/*`

Design:

* This is a redirect/helper flow using encoded person data.
* Create supporting screen/state if needed:

  * “Loading your saved registration data”
  * “Continue registration”
  * Error state if the link is invalid or expired.

F. Corona-Warn-App consent/transmission flow

Current route: `/warnapp/:credentials`

Design full flow:

* Start screen explaining Corona-Warn-App transmission.
* Consent choice:

  * No transmission
  * Transmission with personal data
  * Anonymous transmission
* Policy dialog.
* Loading/progress state while transmitting.
* Success state with CWA QR code.
* Error state.
* Result eligibility form if required.
* Keep the UX official, medical, and privacy-focused.

Admin app flows to design:

A. Admin login

Current route: `/admin/login`

Design:

* Professional admin login screen.
* Center logo/name.
* Username/password fields.
* First-login/registration-data variant if URL data exists.
* Error state.
* Loading state.
* Security badge.
* Forgot/help link placeholder.
* Responsive desktop/mobile.

B. Admin shell

Current route: `/admin/sections/*`

Create a strong enterprise admin layout:

* Dark navy sidebar.
* Collapsible sidebar.
* Top bar with:

  * Page title
  * Search
  * Date/time
  * New appointment button
  * User/agent menu
  * Notification indicator
* Main content area with clean cards and tables.
* Breadcrumbs where useful.
* Responsive tablet/mobile behavior.
* Do not use old Bootstrap column feeling.

Sidebar navigation must include all current and future sections:

* Dashboard
* Today
* Appointments
* Test persons / patients
* Archive
* Agents
* Settings

  * Basic data
  * Email / health office
  * Test types
  * Opening times
  * Slot settings
  * Test kits
* Reports / audit logs can be shown as future/optional items but visually separated.

C. Admin Dashboard

Current route: `/admin/sections/dashboard`

Current data:

* Statistics endpoint: appointments by date.
* Chart.js currently used.

Design dashboard:

* KPI cards:

  * Today’s appointments
  * Waiting
  * Checked in
  * Results completed
  * Positive
  * Negative
  * Canceled
  * Capacity utilization
* Chart:

  * Appointments by date
  * Tests by type
  * Results distribution
* Recent appointment table.
* Operational alerts:

  * Fully booked slots
  * Pending results
  * Positive results needing attention
* Date range selector.
* Export/report button.
* Empty state when no data exists.
* Loading skeletons.

D. Today operations page

Current route: `/admin/sections/today`

Current logic splits appointments into 3 tabs:

1. Waiting appointments
2. Checked-in / set result
3. Completed results

Redesign this as an operational command center.

Required structure:

* Header: “Today”
* Date display.
* Summary counts.
* Search/filter bar.
* Tabs:

  * Waiting
  * Checked in
  * Completed
* Each tab must show count chips.
* Cards or table/list depending on screen size.

Waiting tab:

* Show patient/person info.
* Appointment time.
* Test type and price.
* Booking reference.
* Status badge: Waiting.
* Actions:

  * Check in
  * Cancel
* Empty state.

Checked-in tab:

* Show person info.
* Check-in time.
* Timer/progress showing required wait time for result readiness.
* Active test kit.
* Actions:

  * Negative
  * Invalid
  * Positive
* Negative button green.
* Invalid button neutral/gray.
* Positive button red and requires clear confirmation.
* Show loading state after submitting result.

Completed tab:

* Show result badge:

  * Negative
  * Positive
  * Invalid
* Show emitted time/agent if available.
* Print PDF result action.
* QR/result action if available.
* Visual marker for positive/negative/invalid.
* Search/filter by result type.

E. Appointments page

Current route: `/admin/sections/appointments`

Current logic:

* Date range selection.
* Appointments grouped by date.
* Appointment cards.

Redesign:

* Date range picker.
* Search field.
* Filters:

  * Status
  * Test type
  * Result
  * Agent
* Group by day.
* Day section headers with count.
* Appointment table/list with:

  * Time
  * Patient
  * Test type
  * Status
  * Result
  * Actions
* Responsive cards on mobile/tablet.
* Empty state for date range.
* Loading skeleton.

F. New appointment dialog

Current component: `NewAppointmentDialog`

Design:

* Admin can manually create a new appointment.
* Use a modal or right-side drawer.
* Step/section layout:

  1. Test type
  2. Appointment date/time
  3. Person details
  4. Summary
* Reuse public booking components where possible.
* Include email repeat validation.
* Include country selector.
* Confirm CTA.
* Success toast.
* Error state.

G. Agents page

Current route: `/admin/sections/agents`

Current flow:

* List agents.
* Create new agent dialog.
* Agent fields:

  * Username
  * Email
  * First name
  * Last name
  * Birth date
  * Telephone
  * Address
  * Postal code
  * City
  * Country

Design:

* Agents overview page.
* KPI cards:

  * Active agents
  * Appointments checked in today
  * Results emitted today
* Agent table/cards.
* Agent avatar initials.
* Role/status badge.
* Last activity placeholder.
* Add agent button.
* Edit agent drawer/dialog.
* Form validation.
* Empty state.

H. Settings page

Current route: `/admin/sections/settings`

Settings sections in repository:

1. Basic data
2. Health office / email
3. Test types
4. Opening times
5. Slot settings
6. Test kits

Design:

* Settings layout with internal side navigation.
* Each section as a polished card.
* Save/cancel actions.
* Unsaved changes state.
* Success/error toast.
* Loading skeleton.
* Separate sections but unified UX.

Basic data:

* Logo upload.
* Center name.
* Address.
* Postal code.
* City.
* Country.

Health office / email:

* Health office email.
* Email-related settings if relevant.

Test types:

* Extendable table.
* Add/edit/remove test type.
* Active/inactive toggle.
* Fields:

  * Label
  * Price
  * Active state
* Clear empty state.

Opening times:

* Repeated weekly group.
* Days of week.
* Open/closed toggle.
* From/to time.
* Validation: if open, both times are required.
* Nice schedule UI.

Slot settings:

* Max persons per slot.
* Explain capacity logic.

Test kits:

* Extendable table.
* Add/edit/remove test kit.
* Active test kit radio selection.
* Only one active test kit.
* Clear status.

I. Archive / test persons / patients

The current sidebar includes test-persons and archive although routes are not fully implemented.

Design future-ready screens:

* Patients/test persons list.
* Archive list.
* Search/filter.
* Patient profile drawer.
* Appointment history.
* Result history.
* Privacy-friendly UI.
* Empty states.

J. Reports / audit logs

Design future-ready optional screens:

* Reports overview.
* Export PDF/CSV.
* Audit trail of agent actions:

  * check-in
  * result emitted
  * cancellation
  * settings changed
  * agent created
* Keep these optional but included in design system/navigation as enterprise extension.

Important appointment statuses:

* Waiting
* Checked in
* Test performed
* Canceled

Important result statuses:

* Negative
* Positive
* Invalid

Use clear visual language:

* Waiting: blue/slate
* Checked in: violet/indigo
* Negative: green
* Positive: red
* Invalid: gray/amber
* Canceled: red muted

Backend behavior to reflect in UI:

* Booking creates appointment and returns QR.
* Confirmation email is sent.
* Cancel URL exists.
* Rebook URL exists.
* QR/PDF generation exists.
* Check-in changes person status.
* Result emission changes status and sends email/PDF.
* CWA transmission can generate QR and send result.
* WebSocket update exists for appointment changes.
* Statistics endpoint exists for appointments by date.
* Settings are loaded from backend.
* Agents are loaded and created through backend.

Frontend architecture requirements for implementation:

Create a feature-based architecture:

src/
app/
App.tsx
providers/
router/
layouts/
shared/
ui/
components/
forms/
icons/
hooks/
utils/
types/
api/
store/
config/
features/
public-booking/
pages/
components/
store/
api/
types/
admin-auth/
pages/
components/
store/
api/
types/
admin-dashboard/
pages/
components/
store/
api/
types/
admin-today/
pages/
components/
store/
api/
types/
admin-appointments/
pages/
components/
store/
api/
types/
admin-agents/
pages/
components/
store/
api/
types/
admin-settings/
pages/
components/
store/
api/
types/
cwa/
pages/
components/
store/
api/
types/
styles/
globals.css
tokens.css
stories/

State management:

Use flux-store with feature stores:

* bookingStore
* appointmentSlotsStore
* authStore
* adminTodayStore
* appointmentsStore
* agentsStore
* settingsStore
* statisticsStore
* cwaStore
* uiStore

Each store should have:

* state
* actions
* selectors
* loading/error states
* optimistic update where useful
* reset methods

API layer:

Create typed API clients:

* bookingApi
* adminApi
* authApi
* statisticsApi
* settingsApi
* agentsApi
* cwaApi

Use typed DTOs and domain models.

Storybook:

Every reusable component must have Storybook stories:

* Default
* Loading
* Empty
* Error
* Disabled
* Mobile
* Dark sidebar/admin context where relevant

Storybook component groups:

* Foundations
* Buttons
* Forms
* Data display
* Navigation
* Feedback
* Booking
* Admin operations
* Settings
* Charts

Design screens to create in Figma:

Public app:

1. Public home — mobile
2. Public home — desktop
3. Select test type — mobile
4. Select test type — desktop
5. Select appointment — mobile
6. Select appointment — desktop
7. Add persons form — mobile
8. Add persons form — desktop
9. Multi-person booking summary
10. Booking done / QR confirmation
11. Booking cancellation
12. Cancellation success
13. Rebooking link loading/error
14. Corona-Warn-App consent start
15. Corona-Warn-App policy dialog
16. Corona-Warn-App success with QR
17. Public error/empty/loading states

Admin app:
18. Admin login
19. Admin dashboard overview
20. Today operations — waiting tab
21. Today operations — checked-in/result tab
22. Today operations — completed results tab
23. Appointment date range page
24. Appointment grouped list
25. New appointment drawer/dialog
26. Agents page
27. Add/edit agent drawer
28. Settings overview
29. Settings basic data
30. Settings health office/email
31. Settings test types
32. Settings opening times
33. Settings slot settings
34. Settings test kits
35. Archive/patients future-ready page
36. Reports/audit logs future-ready page
37. Admin empty states
38. Admin loading skeletons
39. Admin error states
40. Responsive mobile admin fallback

Interaction details:

* Stepper should clearly show active/completed/locked states.
* Test type selection should show selected card state.
* Time slot selection should show available/selected/full states.
* Form validation should be visible but not aggressive.
* Admin check-in action should be fast and obvious.
* Positive result action should require confirmation.
* Printing PDF should be represented with print icon/action.
* New appointment should not navigate away; use drawer/modal.
* Settings save should show success toast.
* WebSocket/live state should be shown with small “Live” indicator where relevant.
* Dashboard data should use realistic healthcare/test-center sample data.
* Make all screens feel like one coherent product, not separate templates.

Quality bar:

The design must feel like a premium enterprise SaaS product, similar in quality to modern tools such as Linear, Vercel dashboard, Stripe dashboard, Doctolib business tools, or high-end hospital operations software, but adapted to a medical rapid-test center.

Avoid:

* Cheap COVID icon overuse.
* Too many gradients.
* Weak contrast.
* Random colors.
* Old Bootstrap tables.
* Material UI default appearance.
* Overly large cards.
* Cluttered admin screens.
* Generic landing-page visuals.
* Missing error/loading/empty states.

Deliverable expected from Figma:

* Full design system.
* All public app screens.
* All admin app screens.
* Reusable components.
* Responsive variants.
* Clear component naming.
* Auto-layout everywhere.
* Variants for interactive states.
* Developer-friendly annotations.
* Notes for React/Tailwind implementation.
* Component names that can map directly to Storybook components.
