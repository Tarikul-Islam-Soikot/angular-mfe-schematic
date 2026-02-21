"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModuleFederation = setupModuleFederation;
const utils_1 = require("../utils");
function setupModuleFederation(options) {
    return (tree) => {
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
    'jest',
    'jasmine',
    '@angular/cli',
    '@angular-devkit/*',
    'typescript',
    'zone.js/testing',
  ],
});`;
        (0, utils_1.createOrOverwrite)(tree, `${options.name}/federation.config.js`, federationConfig, options.force);
        return tree;
    };
}
//# sourceMappingURL=setup-module-federation.js.map