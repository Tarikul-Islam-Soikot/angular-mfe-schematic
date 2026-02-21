import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { createOrOverwrite } from '../utils';

export function setupModuleFederation(options: Schema): Rule {
  return (tree: Tree) => {
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

    createOrOverwrite(tree, `${options.name}/federation.config.js`, federationConfig, options.force);
    return tree;
  };
}