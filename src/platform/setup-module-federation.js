"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModuleFederation = setupModuleFederation;
function setupModuleFederation(options) {
    return (tree) => {
        const packageJson = JSON.parse(tree.read(`${options.name}/package.json`).toString());
        packageJson.dependencies['@angular-architects/native-federation'] = '^21.0.3';
        tree.overwrite(`${options.name}/package.json`, JSON.stringify(packageJson, null, 2));
        const federationConfig = `const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: '${options.name}',
  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    }),
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Skip dev dependencies
    'jest',
    'jasmine',
    '@angular/cli',
    '@angular-devkit/*',
    'typescript',
    // Skip large libraries that shouldn't be shared
    'zone.js/testing',
  ],
});`;
        tree.create(`${options.name}/federation.config.js`, federationConfig);
        return tree;
    };
}
//# sourceMappingURL=setup-module-federation.js.map