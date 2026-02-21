import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function setupJest(options: Schema): Rule {
  return (tree: Tree) => {
    const packageJson = JSON.parse(tree.read(`${options.name}/package.json`)!.toString());
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      'jest': '^30.0.0',
      'jest-environment-jsdom': '^30.0.0',
      'jest-preset-angular': '^16.0.0',
      '@types/jest': '^29.0.0'
    };
    packageJson.scripts.test = 'jest';
    packageJson.scripts['test:watch'] = 'jest --watch';
    packageJson.scripts['test:coverage'] = 'jest --coverage';
    tree.overwrite(`${options.name}/package.json`, JSON.stringify(packageJson, null, 2));

    const jestConfig = `module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  collectCoverageFrom: ['projects/**/src/**/*.ts', '!projects/**/src/**/*.spec.ts'],
  coverageReporters: ['html', 'text-summary', 'lcov']
};`;
    
    tree.create(`${options.name}/jest.config.js`, jestConfig);
    
    const tsconfigSpec = `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jest", "node"],
    "esModuleInterop": true,
    "emitDecoratorMetadata": true
  },
  "files": ["setup-jest.ts"],
  "include": ["src/**/*.spec.ts", "src/**/*.ts"]
}`;
    
    tree.create(`${options.name}/tsconfig.spec.json`, tsconfigSpec);
    tree.create(`${options.name}/setup-jest.ts`, `import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);`);
    return tree;
  };
}