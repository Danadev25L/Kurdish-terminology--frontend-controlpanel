# Ink Shell Redesign — Design Spec

**Date**: 2026-04-19
**Scope**: Shell layer only (sidebar, header, login, global styles). Inner pages redesigned in follow-up phase.
**Direction**: Clean & Professional — monochrome-heavy with indigo accent. Notion-inspired.

## Color System

Replace the existing blue-primary palette with an indigo-accented monochrome system.

| Token | Value | Usage |
|---|---|---|
| `--ink-primary` | `#6366f1` | Active states, links, focus rings, primary badges |
| `--ink-primary-light` | `#f0f0ff` | Active nav background, primary badge bg |
| `--ink-black` | `#111827` | Headings, primary buttons, avatar bg, login panel |
| `--ink-text-1` | `#111827` | Primary text (headings, important labels) |
| `--ink-text-2` | `#374151` | Secondary text (body copy) |
| `--ink-text-3` | `#6b7280` | Tertiary text (inactive nav, descriptions) |
| `--ink-text-4` | `#9ca3af` | Quaternary text (timestamps, hints) |
| `--ink-canvas` | `#fafafa` | Main content background |
| `--ink-surface` | `#ffffff` | Cards, sidebar, header bg |
| `--ink-border` | `#e5e7eb` | Borders, dividers |
| `--ink-border-light` | `#f3f4f6` | Lighter dividers (table rows) |

Semantic colors (success, warning, danger) remain unchanged from the existing palette.

## Typography

- **Font family**: Replace Geist Sans with Inter. Replace Geist Mono with JetBrains Mono.
- **Headings**: `font-weight: 700` or `800`, `letter-spacing: -0.02em`
- **Labels**: `font-size: 11px`, `text-transform: uppercase`, `letter-spacing: 0.05em`, `font-weight: 600`, `color: var(--ink-text-4)`
- **Body text**: `font-size: 13px`, `color: var(--ink-text-2)`, `font-weight: 400` or `500`
- **Page titles**: `font-size: 22px`, `font-weight: 800`, `color: var(--ink-black)`, `letter-spacing: -0.02em`

## Sidebar

Collapsible sidebar with two states: expanded (220px) and collapsed (60px icon-only).

### Expanded state (default)
- **Width**: 220px
- **Background**: `var(--ink-surface)` (`#ffffff`)
- **Right border**: `1px solid var(--ink-border)`
- **Logo area**:
  - "KTP" at `font-size: 15px`, `font-weight: 800`, `color: var(--ink-black)`
  - "CP" superscript: `font-size: 10px`, `color: var(--ink-primary)`, `vertical-align: super`
- **Active nav item**:
  - `background: var(--ink-primary-light)`
  - `color: var(--ink-primary)`
  - `font-weight: 600`
  - `border-radius: 0 8px 8px 0` (rounded right only)
  - `margin-right: 12px` (inset from right edge)
- **Inactive nav item**:
  - `color: var(--ink-text-3)`
  - `font-size: 13px`
  - Padded left to 28px for alignment with active state text
- **User section** (bottom):
  - 30x30px avatar: `border-radius: 8px`, `background: var(--ink-black)`, white initials
  - User name: `font-size: 12px`, `font-weight: 600`, `color: var(--ink-black)`
  - User email: `font-size: 10px`, `color: var(--ink-text-4)`
  - Top border: `1px solid var(--ink-border-light)`

### Collapsed state
- **Width**: 60px
- **Background**: `var(--ink-surface)`
- **Right border**: same as expanded
- **Logo**: 32x32px square, `border-radius: 8px`, `background: var(--ink-black)`, white "K" initial, centered
- **Nav items**: 36x36px icon containers, centered, `border-radius: 8px`
  - Active: `background: var(--ink-primary-light)`, icon color `var(--ink-primary)`
  - Inactive: transparent bg, icon color `var(--ink-text-4)`
- **User avatar**: 30x30px, same as expanded, centered at bottom

### Hover expand behavior
When sidebar is collapsed and user hovers over it for 200ms, a floating overlay panel (220px) appears over the content area showing the full expanded sidebar. Panel disappears 300ms after mouse leaves. Content is not pushed — overlay has `box-shadow: 4px 0 12px rgba(0,0,0,0.08)`.

### Toggle
- Hamburger icon in header toggles between expanded/collapsed states
- Keyboard shortcut: `Ctrl+B`
- State persisted to Zustand UI store (already exists)

## Header

- **Height**: 52px
- **Background**: `var(--ink-surface)`
- **Bottom border**: `1px solid var(--ink-border)`
- **Padding**: `0 24px`

### Left side
- Hamburger toggle icon (visible when sidebar is collapsed, optional when expanded)
- Page title: `font-size: 14px`, `font-weight: 600`, `color: var(--ink-black)`
- Role badge pill: `background: var(--ink-primary-light)`, `color: var(--ink-primary)`, `font-size: 11px`, `font-weight: 500`, `padding: 2px 8px`, `border-radius: 4px`

### Right side
- Notification bell icon: `color: var(--ink-text-4)`, with red dot indicator (7px, `#ef4444`, positioned top-right with 1.5px white border)
- User avatar: 28x28px, `border-radius: 8px`, `background: var(--ink-black)`, white initials

### Interactions
- Bell click navigates to notifications (no dropdown)
- Avatar click navigates to settings (no dropdown)

## Login Page

Split layout — dark brand panel on left, light form on right. Responsive: on mobile (<768px), full-width form only with dark header.

### Left panel (dark)
- **Width**: 45% of viewport
- **Background**: `var(--ink-black)` (`#111827`)
- **Content**: vertically centered, `padding: 48px`
- **Logo**: "KTP" at `font-size: 32px`, `font-weight: 800`, `color: #ffffff`, `letter-spacing: -0.03em`
- **Subtitle**: "CONTROL PANEL" at `font-size: 12px`, `color: var(--ink-primary)`, `font-weight: 600`, `letter-spacing: 0.08em`
- **Description**: `font-size: 14px`, `color: #94a3b8`, `line-height: 1.7`, 24px margin-top
- **Pagination dots**: 3 circles (8px), first is indigo active, others `#374151`

### Right panel (form)
- **Background**: `var(--ink-canvas)` (`#fafafa`)
- **Content**: vertically and horizontally centered, `max-width: 320px`
- **Heading**: "Sign in" at `font-size: 20px`, `font-weight: 700`, `color: var(--ink-black)`
- **Subtext**: "Enter your credentials to continue", `font-size: 13px`, `color: var(--ink-text-4)`
- **Input fields**: `border: 1px solid var(--ink-border)`, `border-radius: 8px`, `padding: 10px 12px`, `font-size: 13px`, white bg
- **Labels**: `font-size: 12px`, `font-weight: 600`, `color: var(--ink-text-2)`, `margin-bottom: 6px`
- **Submit button**: `background: var(--ink-black)`, `color: #ffffff`, `border-radius: 8px`, `padding: 10px`, `font-size: 13px`, `font-weight: 600`, full width
- **Forgot password**: `font-size: 12px`, `color: var(--ink-text-4)`, centered, 16px margin-top

## UI Component Visual Updates

All component APIs and props remain unchanged. Only CSS/Tailwind classes are modified.

### Cards
- Remove `border` property
- `border-radius: 10px`
- `box-shadow: 0 1px 3px rgba(0,0,0,0.04)`
- Background: `var(--ink-surface)`

### Buttons
- **Primary**: `background: var(--ink-black)`, `color: #ffffff`, `border-radius: 8px`
  - Hover: `background: #1e293b` (lighter shade)
- **Secondary**: `background: var(--ink-surface)`, `border: 1px solid var(--ink-border)`, `color: var(--ink-text-2)`
- **Danger**: unchanged (red)
- **Ghost**: unchanged
- **All sizes**: `border-radius: 8px` consistently

### Badges
- Replace `--primary-500` blue with `--ink-primary` indigo for primary variant
- Same pill shape, same size

### Modals
- `border-radius: 12px`
- Overlay: `background: rgba(0,0,0,0.3)` (unchanged)
- Panel: white bg, `box-shadow` as before

### Tables
- Remove outer border
- Row dividers: `1px solid var(--ink-border-light)` (`#f3f4f6`)
- Compact padding: `px-3 py-3`
- Header: `font-size: 11px`, uppercase, `color: var(--ink-text-4)`

## What Is NOT Changing

- Component APIs, props, and interfaces
- Layout structure (sidebar + header + content)
- Routing, navigation items, role-based visibility
- State management (Zustand stores)
- Authentication flow and authorization logic
- Inner page layouts and page-specific components (follow-up phase)
- API client and data fetching
- Any functional behavior

## Files to Modify

1. `app/globals.css` — new color tokens, font imports
2. `app/layout.tsx` — swap Geist fonts to Inter + JetBrains Mono
3. `components/layout/sidebar.tsx` — collapsible redesign
4. `components/layout/dashboard-header.tsx` — simplified header
5. `components/layout/dashboard-shell.tsx` — adjust layout for new sidebar states
6. `app/login/page.tsx` — split layout login
7. `components/ui/button.tsx` — indigo/black primary style
8. `components/ui/card.tsx` — shadow-based, no border
9. `components/ui/badge.tsx` — indigo primary variant
10. `components/ui/modal.tsx` — border-radius update
11. `components/ui/avatar.tsx` — square-rounded style (8px radius)
12. `stores/ui-store.ts` — add sidebar collapse persistence (may already exist)
