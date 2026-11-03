# commercetools Visualizer
The commercetools Visualizer is a [custom application](https://docs.commercetools.com/merchant-center-customizations/custom-applications) related to non-standard types within the commercetools Merchant Center. It supports rendering and editing Subscriptions, API Extensions, Types, States and Custom Objects.

## Introduction

This repository contains components rendering non out-of-the-box types as a custom app. Currently these are:
 * [API Extensions](https://docs.commercetools.com/api/projects/api-extensions)
 * [States](https://docs.commercetools.com/api/projects/states)
 * [Subscriptions](https://docs.commercetools.com/api/projects/subscriptions)
 * [Types](https://docs.commercetools.com/api/projects/types)
 * [Custom Objects](https://docs.commercetools.com/api/projects/custom-objects)

## Installation
The commercetools Visualizer is pre-packaged to run as a connect application. Follow the public documentation on how to run a custom merchant center application in connect and how to configure it in Merchant Center.

## Screenshots

### Home Screen

![Homescreen.png](./visualizer/docs/Homescreen.png)

### API Extensions

List View
![Extensions-List.png](./visualizer/docs/Extensions-List.png)
New View
![Extensions-New.png](./visualizer/docs/Extensions-New.png)

### States

List View
![States-List.png](./visualizer/docs/States-List.png)
Detail View
![States-Details.png](./visualizer/docs/States-Details.png)
New View
![States-New.png](./visualizer/docs/States-New.png)

### Subscriptions

List View
![Subscriptions-List.png](./visualizer/docs/Subscriptions-List.png)
Detail View
![Subscriptions-Details.png](./visualizer/docs/Subscriptions-Details.png)
New View
![Subscriptions-New.png](./visualizer/docs/Subscriptions-New.png)

### Types

List View
![Types-List.png](./visualizer/docs/Types-List.png)
Detail View
![Types-Details.png](./visualizer/docs/Types-Details.png)
New View
![Types-New.png](./visualizer/docs/Types-New.png)

### Custom Objects

List View
![Custom-Objects-List.png](./visualizer/docs/Custom-Objects-List.png)
Detail View
![Custom-Objects-Edit.png](./visualizer/docs/Custom-Objects-Edit.png)

## Local Development

Create a file .env.local within the folder [visualizer](./visualizer) folder like:
```dotenv    
CLOUD_IDENTIFIER=gcp-eu
CUSTOM_APPLICATION_ID=TODO
APPLICATION_URL=https://your_app_hostname.com
INITIAL_PROJECT_KEY=YOUR_PROJECT_KEY
```
Run the following commands

```shell    
cd ./visualizer
npm install
npm run start
```

The code has been built successfully using
* Node v22.16.0
* npm 10.9.2

## Known issues
 - On Types: a field definition's `required` flag can only be set when the field is created; the commercetools API has no update action for it, so changing it on an existing field has no effect.
 - On Subscriptions: the subscription `format` (Platform / CloudEvents) and `status` are not exposed.

## Development

```shell
cd ./visualizer
npm test            # jest
npm run typecheck   # tsc --noEmit
npm run lint
```

The docs screenshots can be regenerated with Cypress (`npm run cypress:screenshots` in `visualizer/`, with the dev server running and `CYPRESS_LOGIN_USER`/`CYPRESS_LOGIN_PASSWORD` set in `.env.local`).
