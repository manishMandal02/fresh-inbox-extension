# Fresh Inbox (v2) - Hybrid Injection Architecture

This project uses a "Hybrid" architecture to modernize Gmail without breaking its core functionality. We inject custom components where necessary (Sidebar) and apply heavy CSS restyling to native elements where robust (Email List).

## Architecture Overview

### 1. Sidebar (Component Injection)
*   **Strategy:** We inject a custom `Sidebar` component directly into Gmail's native sidebar container (`.aeN` or `[role="navigation"]`).
*   **Hiding Native:** We aggressively hide all *native* children of the sidebar container using `hide-gmail.css` (using `:not(#fi-sidebar-root)` selectors).
*   **Compose Button:** We render our own "Compose" button. Clicking it triggers the hidden native Gmail compose button programmatically.
*   **Navigation:** Custom links (`Inbox`, `Sent`, etc.) update `window.location.hash`, leveraging Gmail's internal router to switch views.

### 2. Email List (In-Place Enhancement)
*   **Strategy:** We keep the native Gmail email list DOM (`table[role="main"]`).
*   **Styling:** We use `src/styles/gmail-overrides.css` to transform the traditional table rows (`tr.zA`) into modern, floating "Cards" using `border-spacing` and `box-shadow`.
*   **Benefits:** Preserves native features like virtual scrolling, selection (checkboxes), stars, drag-and-drop, and right-click menus perfectly.

### 3. Compose Window & Dialogs
*   **Strategy:** Native. Since we are not overlaying the entire page, Gmail's native Compose window (which renders at `z-index: 2000+`) naturally floats above our styled UI.
*   **Cleanup:** We hide the native "Floating Action Button" (FAB) and duplicate Compose buttons to ensure a clean interface.

## Project Structure

```
/
├── src/
│   ├── content/
│   │   ├── components/
│   │   │   ├── sidebar/    # Custom Sidebar Component (Injected)
│   │   │   └── layout.ts   # Orchestrator (Injects sidebar, applies classes)
│   │   ├── core/           # State management & Lifecycle
│   │   ├── hide-gmail.css  # Hides native sidebar content & clutter
│   │   └── index.ts        # Entry point (Boot, "Search & Destroy" scripts)
│   └── styles/
│       ├── gmail-overrides.css # The "Card UI" theme for native list
│       └── main.css            # Base variables
├── dist/               # Built extension
└── manifest.config.ts
```

## Critical Files

*   **`src/content/hide-gmail.css`**: The "cleanup" file. Hides native sidebar items, FABs, and specific native Compose buttons using robust selectors.
*   **`src/styles/gmail-overrides.css`**: The "theme" file. Contains the logic to turn the Gmail table into a Card List and style the Sidebar container.
*   **`src/content/index.ts`**: Contains a failsafe `setInterval` loop to find and hide any stubborn native "Compose" buttons that escape CSS selectors.

## Development

-   `npm install`: Install dependencies.
-   `npm run build`: Build the extension.
-   `npm run dev`: Build in watch mode.

## Loading in Chrome

1.  Run `npm run build`.
2.  Open `chrome://extensions`.
3.  Enable **Developer mode**.
4.  Click **Load unpacked**.
5.  Select the `dist` folder.
