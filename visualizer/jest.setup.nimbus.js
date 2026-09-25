// Nimbus (React Aria + Chakra) components rely on browser APIs that JSDOM does
// not implement (ResizeObserver, IntersectionObserver, matchMedia, …). This
// shim is published by Nimbus for exactly this purpose and must run before the
// test framework so components render in JSDOM.
require('@commercetools/nimbus/setup-jsdom-polyfills');
