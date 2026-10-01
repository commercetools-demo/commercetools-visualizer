# Features

Code-derived inventory of what this repo implements. Bullets and key file paths —
the per-feature behavior lives in `specs/`, the screenshots in `visualizer/docs/`.

_Last updated: 2026-10-01._

This repo is a commercetools Merchant Center Custom Application (`connect.yaml`,
`applicationType: merchant-center-custom-application`) that renders and edits
commercetools resource types with no first-class Merchant Center UI: API Extensions,
States, Subscriptions, (custom) Types, and Custom Objects. It is built from scratch —
not a fork of any b2c/b2b storefront starter — on the Nimbus design system
(`@commercetools/nimbus`) and ships as a commercetools Connect deployment
(`connect.yaml`) with a matching `netlify.toml` SPA rewrite for local/preview hosting.
The app code lives under `visualizer/` (an npm / `@commercetools-frontend` `mc-scripts`
project). Data access goes through per-feature connector hooks
(`src/hooks/use-<feature>-connector/`) over the Merchant Center GraphQL proxy.

## API Extensions

- List, create, and edit commercetools [API Extensions](https://docs.commercetools.com/api/projects/api-extensions)
  (`src/components/extensions`), including key, destination and trigger configuration
  and timeout settings (`extensions-form/extensions-form.tsx`).
- Destination editor branches on destination type: an HTTP destination (URL, with
  Authorization-header or Azure Functions authentication) and an AWS Lambda destination
  (ARN, access key/secret), each with its own form
  (`extensions-destinations-form/extensions-destinations-form-http.tsx`,
  `extensions-destinations-form-aws.tsx`).
- Trigger builder lets you check which resource + action combinations invoke the
  extension, across cart, order, payment, customer, quote-request, staged-quote,
  quote, and business-unit resources, for Create and Update actions
  (`extensions-triggers-form/extensions-triggers-form.tsx`).

## States

- List, create, and edit commercetools [States](https://docs.commercetools.com/api/projects/states)
  (`src/components/states`), scoped by state type (Line Item, Order, Payment, Product,
  Quote Request, Quote, Review, Staged Quote) with localized name/description, an
  "initial state" flag, and a multi-select for outgoing transitions
  (`states-form/states-form.tsx`).
- State transition flow diagram: renders a state type's states and transitions as an
  interactive, auto-laid-out (top-to-bottom) graph (`states-list/states-flow.tsx`) using
  `@xyflow/react` + `dagre`; clicking a node opens that state's detail view.

## Subscriptions

- List, create, and edit commercetools
  [Subscriptions](https://docs.commercetools.com/api/projects/subscriptions)
  (`src/components/subscriptions`) with a shared single-page form (no wizard):
  key, destination, changes and messages sections
  (`subscription-details-form/subscription-details-form.tsx`).
- All seven destination types are configurable: Google Cloud Pub/Sub, AWS SQS, AWS SNS,
  AWS EventBridge, Confluent Cloud, Azure Service Bus, and Azure Event Grid, each with
  its own config form (`subscription-destination-form/subscription-destination-form.tsx`
  dispatching to `-gcp.tsx`, `-sqs.tsx`, `-sns.tsx`, `-event-bridge.tsx`,
  `-confluent-cloud.tsx`, `-azure-service-bus.tsx`, `-event-grid.tsx`). Which of them are
  exercised end-to-end against a real queue/topic is not tracked here.
- Confluent Cloud destinations take an optional Kafka record key (omitted when empty).
  Editing an existing subscription loads the config of every destination type into the
  form (`subscription-details-page/convert.ts`).
- Delivery format (Platform or CloudEvents + specification version) is chosen on create, right
  below the key; it is read-only on edit because the API has no update action for it.
- Events: Checkout (9) and Import API (6) event types
  (`subscription-events-form`, `subscription-event-types.ts`), pinned to the API's `EventType`
  enum by a spec; `setEvents` is diffed by the app since `@commercetools/sync-actions` has no
  events support. Message and event groups also offer "receive all of this resource"
  (an entry without `types`).
- Editors for which Messages and Changes a subscription fires on: all 42
  `ChangeSubscriptionResourceTypeId`s (`subscription-changes-form`) and the 23
  `MessageSubscriptionResourceTypeId`s with 293 message types filed under the resource
  they belong to (`subscription-messages-form`, `subscription-message-types.ts`). Both are
  pinned to the API's enums by specs. Messages of resources the API can't subscribe to
  (Cart, Recurring Order, Payment Method, Cart Discount, Discount Code, Discount Group)
  are not offered.

## Types (custom field definitions)

- List, create, and edit commercetools [Types](https://docs.commercetools.com/api/projects/types)
  (`src/components/types`): key, localized name/description, and which resource
  type(s) the type attaches to (`types-form/types-form.tsx`, `constants.ts` for the
  full `RESOURCE_TYPES` list).
- Field definition editor supports Boolean, Date (Date / Time / DateTime), Enum
  (plain or localized), Money, Number, Reference, and String (plain or localized) field
  types, plus a `Set` wrapper and a multi-line input hint for strings
  (`field-definition-input/constants.ts`, `field-definition-input/helpers.ts`).
- Enum and localized-enum values are edited in a drag-and-drop-reorderable value editor
  (`field-definition-input-for-enum/field-definition-input-for-enum.tsx`). Adding,
  relabelling, removing, and reordering persisted values are all supported; removals are
  diffed client-side because `@commercetools/sync-actions` never emits them
  (`use-types-connector/types-connector.ts`).
- Types can attach to all 38 `ResourceTypeId`s (`types-form/constants.ts`), and Reference
  fields can target all 19 `CustomFieldReferenceValue`s (approval-flow, approval-rule,
  associate-role, business-unit, cart, cart-discount, category, channel, customer,
  customer-group, key-value-document, order, product, product-type, review, state,
  shipping-method, variant, zone) (`field-definition-input/constants.ts`). Both lists are
  pinned by specs.
- Field definitions table per type, with add, edit, and delete of individual field
  definitions (`field-definitions-list/field-definitions-list.tsx`). Deleting a field is
  staged in the type form and only applied on Save (Revert undoes it).

## Custom Objects

- List, create, and edit commercetools [Custom Objects](https://docs.commercetools.com/api/projects/custom-objects)
  by container + key, with a debounced search-by-container and a paginated/sortable
  table (`custom-objects/custom-objects-list/custom-objects-list.tsx`).
- Raw JSON value editing via an embedded `vanilla-jsoneditor` instance wrapped as a
  React component, supporting text, tree, and table editing of the object's value
  (`custom-object-form/value-editor.tsx`, `custom-object-form/custom-object-form.tsx`).

## Localization and permissions

- UI is translated for English and German (`src/i18n/data/en.json`, `de.json`), with
  localized name/description fields throughout using the project's configured
  `dataLocale` and language fallback order.
- View vs. Manage permission checks per section, derived from the application's
  `entryPointUriPath` (`src/constants.ts`, `@commercetools-frontend/permissions`'s
  `useIsAuthorized`): without Manage, forms render read-only and Save/Delete/Add are
  disabled rather than hidden. The `oAuthScopes` in `custom-application-config.mjs`
  request `view_*` for states, types, orders, customers, products, shopping lists,
  key-value-documents, business units, stores and product selections, and `manage_*` for
  states, subscriptions, types, extensions, orders, shopping lists and
  key-value-documents.

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
- Docs screenshots in `visualizer/docs/` are regenerated headlessly against a logged-in
  session with `visualizer/scripts/screenshots/` (see its README).

## Testing

- Jest + Testing Library, with the GraphQL layer mocked by `msw`; connector, conversion,
  helper and column-definition logic have unit specs, and each feature's list/create/edit
  pages have component specs next to them (`npm test`).
- Types fixtures are built with `@commercetools-test-data/type` via
  `src/test-utils/models/types/`; subscriptions use their own builders under
  `src/test-utils/models/subscriptions/`.

## Known limitations

- Only `required` at field creation: the commercetools API has no update action for a
  field definition's `required` flag, so it is shown on edit but cannot be changed
  (`specs/002-types/spec.md`).
- Subscription `status` is not exposed. IronMQ is not supported: it is not a destination
  documented on docs.commercetools.com and has no type in the GraphQL schema.
- Former visualizations (`entity-diagram`, `visualize-drilldown`) and the Carts /
  Shopping Lists views were removed and are not being reimplemented
  (`specs/README.md`).
- CI (`.github/workflows/ci.yml`) runs only `npm run build` and `npm run test`; lint and
  typecheck are not enforced.
