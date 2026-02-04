import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function setupJest(options: Schema): Rule {
  return (tree: Tree) => {
    const packageJson = JSON.parse(tree.read(`${options.name}/package.json`)!.toString());
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      'jest': '^30.0.0',
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
    tree.create(`${options.name}/setup-jest.ts`, `import 'jest-preset-angular/setup-jest';`);
    return tree;
  };
}