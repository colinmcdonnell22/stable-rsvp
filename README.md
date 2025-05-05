# STABLE RSVP Application

A Next.js 14 application for RSVP management for STABLE dinner events.

## Features (Planned)

- Landing page with RSVP button
- RSVP form with validation
- Seat picker interface
- Real-time seat map updates

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Languages**: TypeScript
- **Package Manager**: pnpm

## Development Progress

- [x] FE-01: Project Skeleton & Theme Tokens
- [x] FE-02: Landing Page ("HELLO + RSVP")
- [x] FE-03: RSVP Form Modal
- [x] FE-04: Client-Side Validation & Error States
- [x] FE-05: Submit & Redirect to Seat-Picker
- [x] FE-06: Seat-Picker Canvas Layout
- [x] FE-07: Seat Selection Logic
- [ ] FE-08: Confirm Seat & Lock
- [ ] FE-09: Live Seat Map Stub
- [ ] FE-10: Mobile & A11y Enhancements
- [ ] FE-11: Global Loader & Toast utilities

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## RSVP Modal Component (FE-03)

The RSVP Modal component allows users to submit their RSVP information with a sleek, animated interface:

- **Responsive Design**:
  - On mobile: Slides up from the bottom
  - On desktop: Fades in centered on the screen

- **Form Fields**:
  - Full Name (required)
  - Email (required)
  - Phone (optional)
  - Dietary Notes (optional)

- **Accessibility Features**:
  - Focus trap to keep keyboard focus within the modal
  - Keyboard navigation support
  - ARIA attributes for screen readers
  - ESC key to close modal

- **User Experience**:
  - Form validation with error messages
  - Submit button disabled until required fields are valid
  - Power-user feature: Cmd/Ctrl+Enter to submit
  - Click outside modal to close

## Client-Side Validation & Error States (FE-04)

Enhanced form validation and error handling for the RSVP form:

- **Field-Level Validation**:
  - Full Name: Cannot be empty
  - Email: Must match a valid email pattern
  - Red border appears around invalid fields
  - Helper text appears below invalid fields explaining the error

- **Form-Level Validation**:
  - Global error banner appears at the top when attempting to submit with invalid inputs
  - Banner automatically fades out after 3 seconds
  - Banner only shows when form has validation errors

- **Accessibility Improvements**:
  - ARIA attributes for invalid states
  - Error messages are programmatically associated with form fields
  - Form validation is triggered on blur and on submit attempts

## Submit & Redirect to Seat-Picker (FE-05)

Implemented the RSVP submission flow with redirection to the seat picker page:

- **Submission Process**:
  - Simulates an API call with a 500ms delay
  - Displays a loading overlay during submission
  - Handles successful submissions and errors gracefully

- **State Management**:
  - Stores guest information in a React Context
  - Makes guest data accessible throughout the application
  - Preserves user data between pages without page refreshes

- **Navigation**:
  - Uses Next.js client-side navigation via `router.push()`
  - Updates URL without triggering a full page reload
  - Redirects to `/tables` route after successful submission

- **Seat Picker Page**:
  - Displays the submitted guest information
  - Prevents direct access without going through the RSVP process
  - Includes navigation back to the home page

## Seat-Picker Canvas Layout (FE-06)

Implemented an interactive visual layout for selecting seats at dinner tables:

- **Interactive Canvas**:
  - Full-screen black canvas covering the viewport
  - Renders 10 large circles representing tables in a 2×5 grid using SVG
  - Each table has 8 smaller outlined circles around the perimeter for seats
  - Empty seats have stroke-only styling for a clean look

- **Responsive Design**:
  - Tables resize responsively based on viewport dimensions
  - At 1280px width, each table is approximately 160px in diameter
  - Maintains proper spacing between tables and seats at all screen sizes

- **Interactive Elements**:
  - Hover state changes seat stroke to an accent gradient
  - Keyboard focus has the same visual effect as hover
  - Supports full keyboard navigation through tabbing
  - Provides clear visual feedback on interaction

- **Accessibility Features**:
  - Proper ARIA labels for tables and seats
  - Keyboard navigation fully supported
  - Focus states match hover states for consistent experience
  - Clear instructions for seat selection

## Seat Selection Logic (FE-07)

Enhanced the seat picker with interactive selection and confirmation functionality:

- **Selection Features**:
  - Click on a seat to select it (green outline appears)
  - Only one seat can be selected at a time
  - Click the same seat again to deselect it
  - Keyboard navigation fully supported with the same visual feedback

- **Confirmation Process**:
  - Floating "Confirm Seat" button appears when a seat is selected
  - Button is prominently placed at the bottom center of the screen
  - Visual confirmation appears after seat selection is confirmed
  - User can change their selection even after confirmation

- **Visual Feedback**:
  - Selected seats have a distinct green gradient outline
  - Hover and focus states maintained for non-selected seats
  - Clear visual indication in the UI about current selection status
  - Informative help text in the footer guides users through the process

- **State Management**:
  - Fully controlled component pattern for consistent state handling
  - Parent-child state synchronization ensures UI consistency
  - Selection persists through page refreshes via localStorage
  - Prevents invalid states (e.g., confirming without selection)

- **Debugging & Error Handling**:
  - Comprehensive logging for troubleshooting selection issues
  - Graceful error handling for localStorage operations
  - Clear state transitions with visual feedback for users
  - Consistent state management between components

## Development

### Tech Stack
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hooks

### Component Structure
The RSVP Modal is implemented as a standalone component that can be imported and used throughout the application. It uses React's state management to handle form data and validation.
