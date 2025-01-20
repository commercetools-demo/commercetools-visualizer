# commercetools Visualizer
The commercetools Visualizer is a [custom application](https://docs.commercetools.com/merchant-center-customizations/custom-applications) related to non-standard types within the commercetools Merchant Center. It supports rendering various elements like Subscriptions, API Extensions, Types, States, Shopping Lists and Carts.

## Introduction

This repository contains components rendering non out-of-the-box types as a custom app. Currently these are:
 * [API Extensions](https://docs.commercetools.com/api/projects/api-extensions)
 * [Carts](https://docs.commercetools.com/api/projects/carts)
 * [Shopping Lists](https://docs.commercetools.com/api/projects/shoppingLists)
 * [States](https://docs.commercetools.com/api/projects/states)
 * [Subscriptions](https://docs.commercetools.com/api/projects/subscriptions)
 * [Types](https://docs.commercetools.com/api/projects/types)
 * [Custom Objects](https://docs.commercetools.com/api/projects/custom-objects)

## Installation
The commercetools Visualizer is pre-packaged to run as a connect application. Follow the public documentation on how to run a custom merchant center application in connect and how to configure it in Merchant Center.

## Screenshots

### Home Screen

![Homescreen.jpg](./visualizer/docs/Homescreen.jpg)

### API Extensions

List View
![Types-List.jpg](./visualizer/docs/Extensions-List.jpg)
New View
![Types-New.jpg](./visualizer/docs/Extensions-New.jpg)

### Carts

List View
![Types-List.jpg](./visualizer/docs/Carts-List.jpg)
Detail View
![Types-Details.jpg](./visualizer/docs/Carts-Details.jpg)
New View
![Types-New.jpg](./visualizer/docs/Carts-New.jpg)

### Shopping Lists

List View
![Types-List.jpg](./visualizer/docs/Shoppinglists-List.jpg)
Detail View
![Types-Details.jpg](./visualizer/docs/Shoppinglists-Details.jpg)
New View
![Types-New.jpg](./visualizer/docs/Shoppinglists-New.jpg)

### States

List View
![Types-List.jpg](./visualizer/docs/States-List.jpg)
Detail View
![Types-Details.jpg](./visualizer/docs/States-Details.jpg)
New View
![Types-New.jpg](./visualizer/docs/States-New.jpg)

### Subscriptions

List View
![Types-List.jpg](./visualizer/docs/Subscriptions-List.jpg)
Detail View
![Types-Details.jpg](./visualizer/docs/Subscriptions-Details.jpg)
New View
![Types-New.jpg](./visualizer/docs/Subscriptions-New.jpg)

### Types

List View
![Types-List.jpg](./visualizer/docs/Types-List.jpg)
Detail View
![Types-Details.jpg](./visualizer/docs/Types-Details.jpg)
New View
![Types-New.jpg](./visualizer/docs/Types-New.jpg)

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
yarn install
yarn run start
```

The code has been built sucessfully using 
* Node v18.12.0
* Yarn 1.22.22

## Known issues
 - On Subscriptions:
   - only GCP is currently supported
 - On Types
   - Deleting enum and localized enum values is not supported
   - Change order of enum and localized enum values is not supported
 - On Carts
   - Support for `Line Items` only, not for `Custom Line Items`