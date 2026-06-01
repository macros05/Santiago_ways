const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// npm-workspaces: watch the workspace root so Metro sees the hoisted node_modules.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Web-only stubs for native modules with no web support, so the app can be
// run/reviewed in a browser (e.g. via Playwright). Native builds are unaffected.
const WEB_STUBS = {
  'react-native-maps': path.resolve(projectRoot, 'web-stubs/react-native-maps.js'),
  '@maplibre/maplibre-react-native': path.resolve(projectRoot, 'web-stubs/empty.js'),
  'react-native-health': path.resolve(projectRoot, 'web-stubs/empty.js'),
  'react-native-health-connect': path.resolve(projectRoot, 'web-stubs/empty.js'),
  'react-native-purchases': path.resolve(projectRoot, 'web-stubs/empty.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && WEB_STUBS[moduleName]) {
    return { type: 'sourceFile', filePath: WEB_STUBS[moduleName] };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
