// apps/mobile/metro.config.js
// Monorepo Metro configuration for LaunchCommerce Expo Mobile App

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const mobileNodeModules = path.resolve(projectRoot, 'node_modules');

// Ensure monorepo node_modules are present in NODE_PATH for Babel & worker resolution
if (!process.env.NODE_PATH) {
  process.env.NODE_PATH = mobileNodeModules;
} else if (!process.env.NODE_PATH.includes(mobileNodeModules)) {
  process.env.NODE_PATH = `${mobileNodeModules}${path.delimiter}${process.env.NODE_PATH}`;
}
require('module').Module._initPaths();

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve hoisted packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;

