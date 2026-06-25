# Feature: Welcome / Home

**Status:** Extracted from existing implementation
**Domain:** application landing screen
**Spec version:** 1.0 (2026-06-25)

> Shared conventions are in [../README.md](../README.md).

## 1. Overview

The Welcome screen is the application's landing page. It introduces the Visualizer and
presents one navigation card per feature, each linking to that feature's section.

## 2. User scenarios

- As a merchant, I land on a titled page describing the Visualizer.
- As a merchant, I see a grid of feature cards (title + short description) and click one to
  open that feature.

## 3. Functional requirements

- **FR-001** Render the page title: "A visualizer for all non out-of-the-box types in
  Merchant Center."
- **FR-002** Render a responsive grid of feature cards; each card has a title, a short
  description, and a "View {title}" action that navigates to the feature's route.
- **FR-003** Cards (title → route):
  - Types → `types`
  - Subscriptions → `subscriptions`
  - States → `states`
  - API Extensions → `extensions`
  - Custom Objects → `custom-objects`
  - Visualize → `visualize`
  - Visualize Drilldown → `visualize-drilldown`
  - Entity Diagram → `entity-diagram`
- **FR-004** The Welcome screen is the default/fallback route — any unmatched path renders it.

## 4. Views & navigation

Single page at the app root `/`. Each card navigates to `{appRoot}/{target}`.

## 5. Edge cases & known limitations

- The "Visualize" card links to a `visualize` route whose component is absent / superseded by
  Visualize Drilldown and Entity Diagram. Either restore a target for it or drop the card in
  the reimplementation.
- Card descriptions are static copy (see source for exact wording).

## 6. Out of scope / non-goals

- Dashboards, metrics, or recently-viewed lists — the screen is purely navigational.

## Review checklist

- [ ] Title and all feature cards/targets captured
- [ ] Default/fallback-route behavior stated
- [ ] Dangling "Visualize" card flagged
