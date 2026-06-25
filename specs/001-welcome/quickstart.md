# Quickstart: Welcome / Home

The landing page is purely navigational — no API calls, no `contracts/`. Build it after the
app shell and routing exist.

## Prerequisites

- A commercetools Merchant Center **custom application** scaffold with the MC application
  shell rendering, and the **Nimbus** design system available.
- Routing in place (e.g. a top-level router that mounts each feature under the app root).

## Steps

1. **Default/fallback route.** Mount the Welcome screen as the catch-all route so any
   unmatched path renders it (see `spec.md` FR-004).

2. **Page scaffold.** Render the page title (FR-001) inside a wide page-content container,
   using Nimbus layout primitives.

3. **Feature card grid.** Render a responsive grid of cards (FR-002). Each card: a title, a
   short static description, and a "View {title}" action navigating to `{appRoot}/{target}`.
   Targets (FR-003): `types`, `subscriptions`, `states`, `extensions`, `custom-objects`.

   > Do **not** add cards for `visualize`, `visualize-drilldown`, or `entity-diagram` — those
   > features are not being reimplemented.

4. **Menu links.** Mirror the same destinations in the custom-application config
   `submenuLinks` (see the original `custom-application-config.mjs`), gated by the `View`
   permission. Note `extensions` and `subscriptions` require `Manage` in the original config.

## Verification

- [ ] Visiting the app root shows the titled landing page.
- [ ] Each card navigates to the correct feature route.
- [ ] No dangling cards for non-reimplemented visualizations.
- [ ] An unknown path falls back to this screen.
