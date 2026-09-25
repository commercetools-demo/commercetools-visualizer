# Features

Code-derived inventory of what this repo implements. Bullets and key file paths —
the mechanism lives in `docs/how-it-works.md`, the walkthrough in `docs/demo-script.md`.

_Last generated: 2026-09-02 by feature-doc._

This repo is a commercetools Merchant Center Custom Application (`connect.yaml`,
`applicationType: merchant-center-custom-application`) that renders and edits
commercetools resource types with no first-class Merchant Center UI: API Extensions,
States, Subscriptions, (custom) Types, and Custom Objects, plus two purpose-built
visualization tools for exploring a project's data graph. It is built from scratch —
not a fork of any b2c/b2b storefront starter — and ships as a commercetools Connect
deployment (`connect.yaml`) with a matching `netlify.toml` SPA rewrite for local/preview
hosting. The app code lives under `visualizer/` (an npm / `@commercetools-frontend`
`mc-scripts` project); routing, forms and data-fetching lean on shared internal
`commercetools-demo-shared-*` packages (checkbox-group, data-fetching-hooks,
entity-selectors, paginatable-data-table, save-toolbar, stepper, helpers) rather than
any storefront starter's code.

## API Extensions

- List, create, and edit commercetools [API Extensions](https://docs.commercetools.com/api/projects/api-extensions)
  (`src/components/extensions`), including key, destination and trigger configuration
  and timeout settings (`extensions-form/extensions-form.tsx`).
- Destination editor branches on destination type: an HTTP destination (URL,
  authentication) and an AWS Lambda destination (ARN), each with its own form
  (`extensions-destinations-form/extensions-destinations-form-http.tsx`,
  `extensions-destinations-form-aws.tsx`).
- Trigger builder lets you check which resource + action combinations invoke the
  extension, across cart, order, payment, customer, quote-request, staged-quote,
  quote, and business-unit resources, for Create and Update actions
  (`extensions-triggers-form/extensions-triggers-form.tsx`).

## States

- List, create, and edit commercetools [States](https://docs.commercetools.com/api/projects/states)
  (`src/components/states`), scoped by state type (Order, Line Item, Product, Review,
  Payment, Quote Request, Staged Quote, Quote states) with localized name/description,
  an "initial state" flag, and a multi-select for outgoing transitions
  (`states-form/states-form.tsx`).
- State transition flow diagram: renders a state type's states and transitions as an
  interactive, auto-laid-out graph (`states-list/states-flow.tsx`) using `reactflow` +
  `dagre`, marking initial states as flow inputs and terminal (no-outgoing-transition)
  states as flow outputs, with a toggle between horizontal and vertical layout.

## Subscriptions

- List, create (multi-step wizard), and edit commercetools
  [Subscriptions](https://docs.commercetools.com/api/projects/subscriptions)
  (`src/components/subscriptions`), covering general info, destination
  configuration, message/changes selection, and a review step
  (`subscription-create/subscription-create.tsx`).
- Destination type router supports Google Cloud Pub/Sub, AWS SQS, and Confluent
  Cloud, each with its own credential/config form
  (`subscription-destination-form/subscription-destination-form.tsx` dispatching to
  `-gcp.tsx`, `-sqs.tsx`, `-confluent-cloud.tsx`); README notes only GCP is exercised
  end-to-end today.
- Editors for which resource-type Messages (order, cart, customer, etc.) and which
  Changes (resource-type + fields) a subscription fires on
  (`subscription-messages-form`, `subscription-changes-form`).

## Types (custom field definitions)

- List, create, and edit commercetools [Types](https://docs.commercetools.com/api/projects/types)
  (`src/components/types`): key, localized name/description, and which resource
  type(s) the type attaches to (`types-form/types-form.tsx`, `constants.ts` for the
  full `RESOURCE_TYPES` list).
- Field definition editor supports Boolean, Date, Enum, Money, Number, Reference, and
  String field types (`field-definition-input/constants.ts`), including a dedicated
  localized-enum / plain-enum values editor with add/reorder rows
  (`field-definition-input-for-enum/field-definition-input-for-enum.tsx`) — the
  README calls out that deleting or reordering enum values isn't supported yet.
- Reference field type supports 14 target resource types (approval-flow,
  associate-role, business-unit, cart, category, channel, customer,
  key-value-document, order, product, product-type, review, state, shipping-method,
  zone) (`field-definition-input/constants.ts`).
- Field definitions list/table view per type, with add/edit/reorder of individual
  field definitions against a live type version
  (`field-definitions-list/field-definitions-list.tsx`).

## Custom Objects

- List, create, and edit commercetools [Custom Objects](https://docs.commercetools.com/api/projects/custom-objects)
  by container + key, with search-by-container and a paginated/sortable table
  (`custom-objects/custom-objects-list/custom-objects-list.tsx`).
- Raw JSON value editing via an embedded `vanilla-jsoneditor` instance wrapped as a
  React component, supporting both tree and text/code editing of the object's value
  (`custom-object-form/value-editor.tsx`, `custom-object-form/custom-object-form.tsx`).

## Entity relationship diagram (`entity-diagram`)

- Freeform, editable diagram of a project's Types and Product Types as draggable
  nodes with connectable, labeled edges, built on `@xyflow/react`
  (`src/components/entity-diagram/canvas.tsx`).
- Node positions and edges are persisted back into the commercetools project as
  Custom Objects (`mc-link-data` container, `linkDataList`/`locationDataList` keys) so
  the diagram layout survives reloads, alongside a separate `mc-custom-object-schema`
  container that seeds schema-derived nodes (`hooks/index.ts`, formerly
  `carts/hooks/use-quote-request.ts`'s sibling connector — see `entity-diagram/hooks`).
- Inline edge label editing, keyboard delete of selected edges, and change-tracking
  provider that batches node/link mutations before they're saved
  (`custom-edge.tsx`, `custom-node.tsx`, `providers/changes.tsx`).

## Commerce data explorer / drilldown treemap (`visualize-drilldown`)

- Interactive, multi-level treemap for drilling from one commercetools entity type
  into its related entities, starting from Business Unit, Store, Channel, Product,
  Category, Product Selection, Standalone Price, Customer Group, or Associate
  (`visualize-drilldown/visualize-drilldown.tsx`,
  `utils/relationship-contstants.ts:ALL_ENTITY_TYPES`).
- A relationship graph encodes which child entity types each root can drill into and
  how to query them (e.g. business-unit → store/associate/business-unit, store →
  product-selection/channel/cart-discount/customer, product → product-selection/
  standalone-price/category) (`utils/relationships.ts`, `utils/relationship-contstants.ts:RELATIONSHIP_QUERIES`).
- Breadcrumb navigation to jump back to any drilldown level or to root, an entity
  info side panel with the raw entity payload, search + sort on root-level entities,
  per-entity-type visibility toggles (show/hide/show-all), and "load more"
  pagination per level (`components/breadcrumb-navigation.tsx`,
  `components/entity-info-panel.tsx`, `components/search-and-sort-controls.tsx`,
  `components/multi-level-treemap.tsx`).
- Per-node summary stats computed via secondary CT API queries — e.g. a Business
  Unit node shows associate/store/division counts, a Product node shows variant,
  standalone-price and category counts (`utils/relationship-contstants.ts:ENTITY_DATA_QUERIES`).

## Localization and permissions

- UI is translated for English and German (`src/i18n/data/en.json`, `de.json`), with
  localized name/description fields throughout using the project's configured
  `dataLocale` and language fallback order.
- Fine-grained View vs. Manage permission checks per section, derived from the
  application's `entryPointUriPath` (`src/constants.ts`,
  `@commercetools-frontend/permissions`'s `useIsAuthorized`); submenu entries for
  Extensions and Subscriptions require Manage, the app's `oAuthScopes` request both
  view_* and manage_* scopes for states, types, orders, customers, products, shopping
  lists, key-value-documents, business units, stores, product selections, standalone
  prices, subscriptions, extensions and quote requests (`custom-application-config.mjs`).

## Deployment and configuration

- Ships as a commercetools Connect application
  (`applicationType: merchant-center-custom-application`) with standard configuration
  for `CUSTOM_APPLICATION_ID`, `ENTRY_POINT_URI_PATH` (default `visualizer`),
  `INITIAL_PROJECT_KEY`, and `CLOUD_IDENTIFIER` (default `gcp-eu`) (`connect.yaml`).
- Local development via `.env.local` + `npm start` against a real commercetools
  project (`README.md`); GraphQL types are generated against the CT GraphQL API via
  `codegen.ctp.yml` / `generate-types:ctp`.
- `netlify.toml` SPA rewrite (`/* -> /index.html`) supports hosting a static preview
  build outside of Connect/Merchant Center.

## Known limitations (stated in code/docs)

- Subscriptions: only the Google Cloud Pub/Sub destination is exercised as fully
  working; SQS and Confluent Cloud forms exist but are not confirmed end-to-end
  (`README.md`).
- Types: deleting an enum/localized-enum value, and reordering enum/localized-enum
  values, are not supported in the field definition editor (`README.md`,
  `field-definition-input-for-enum`).
- The `carts/` component directory is nearly empty (`use-quote-request.ts` only); a
  historical commit ("sunsetting carts and shopping lists") removed the earlier
  Cart/Shopping List visualizer views on the basis that carts are now a native
  product feature and shopping lists are better served by a separate custom view.
