"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModuleFederation = setupModuleFederation;
const utils_1 = require("../utils");
function setupModuleFederation(options) {
    return (tree) => {
        const packageJson = JSON.parse(tree.read(`${options.name}/package.json`).toString());
        packageJson.dependencies['@angular-architects/native-federation'] = '^21.0.3';
        tree.overwrite(`${options.name}/package.json`, JSON.stringify(packageJson, null, 2));
        const federationConfig = `const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: '${options.name}',
  exposes: {
    './Routes': './src/app/app.routes.ts',
    './DemoModule': './src/app/modules/demo/demo.module.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
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