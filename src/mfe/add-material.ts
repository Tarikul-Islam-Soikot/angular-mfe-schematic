import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function addAngularMaterial(options: Schema): Rule {
  return (tree: Tree) => {
    const packageJson = JSON.parse(tree.read(`${options.name}/package.json`)!.toString());
    packageJson.dependencies['@angular/material'] = '^21.0.0';
    packageJson.dependencies['@angular/cdk'] = '^21.0.0';
    packageJson.dependencies['@angular/animations'] = '^21.0.0';
    tree.overwrite(`${options.name}/package.json`, JSON.stringify(packageJson, null, 2));
    return tree;
  };
}