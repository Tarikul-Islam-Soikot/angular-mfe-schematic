"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAngularMaterial = addAngularMaterial;
function addAngularMaterial(options) {
    return (tree) => {
        const packageJson = JSON.parse(tree.read(`${options.name}/package.json`).toString());
        packageJson.dependencies['@angular/material'] = '^21.0.0';
        packageJson.dependencies['@angular/cdk'] = '^21.0.0';
        packageJson.dependencies['@angular/animations'] = '^21.0.0';
        packageJson.dependencies['@angular/common'] = '^21.0.0';
        tree.overwrite(`${options.name}/package.json`, JSON.stringify(packageJson, null, 2));
        return tree;
    };
}
//# sourceMappingURL=add-material.js.map