// Custom Jest resolver. It preserves the behaviour of the MC preset's resolver
// (forcing a few faulty ESM-only packages to their CJS entry point) and adds a
// fix for a Nimbus 3.x packaging bug.
//
// Nimbus' CJS build (`dist/index.cjs` and its chunks) contains internal
// requires that point at `*.cjs.js` files which are never emitted — only the
// `*.cjs` files exist. Webpack (mc-scripts) consumes the ESM `module` build, so
// the production bundle is unaffected; Jest resolves the CJS `main`, so we map
// the bogus `.cjs.js` suffix back to the real `.cjs` file.
const modulesWithFaultyExports = [
  '@react-hook/resize-observer',
  '@react-hook/passive-layout-effect',
  '@react-hook/latest',
];

module.exports = (request, options) => {
  const resolveRequest =
    request.endsWith('.cjs.js') && !request.endsWith('.esm.js')
      ? request.slice(0, -'.js'.length)
      : request;

  return options.defaultResolver(resolveRequest, {
    ...options,
    packageFilter: (pkg) => {
      if (modulesWithFaultyExports.includes(pkg.name)) {
        delete pkg['exports'];
        delete pkg['module'];
      }
      return pkg;
    },
  });
};
