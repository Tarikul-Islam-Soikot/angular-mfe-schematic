import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { createOrOverwrite } from '../utils';

export function addLintAndFormat(options: Schema): Rule {
  return (tree: Tree) => {
    createOrOverwrite(tree, `${options.name}/.prettierrc`, JSON.stringify({
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 100,
      "tabWidth": 2,
      "endOfLine": "lf"
    }, null, 2), options.force);

    createOrOverwrite(tree, `${options.name}/.prettierignore`, `node_modules
dist
*.js.map
*.d.ts
coverage
.angular
`, options.force);

    createOrOverwrite(tree, `${options.name}/.eslintrc.json`, JSON.stringify({
      "root": true,
      "ignorePatterns": ["projects/**/*"],
      "overrides": [
        {
          "files": ["*.ts"],
          "extends": [
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:@angular-eslint/recommended",
            "plugin:@angular-eslint/template/process-inline-templates",
            "prettier"
          ],
          "rules": {
            "@angular-eslint/directive-selector": [
              "error",
              { "type": "attribute", "prefix": "app", "style": "camelCase" }
            ],
            "@angular-eslint/component-selector": [
              "error",
              { "type": "element", "prefix": "app", "style": "kebab-case" }
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
          }
        },
        {
          "files": ["*.html"],
          "extends": [
            "plugin:@angular-eslint/template/recommended",
            "plugin:@angular-eslint/template/accessibility"
          ],
          "rules": {}
        }
      ]
    }, null, 2), options.force);

    createOrOverwrite(tree, `${options.name}/cspell.json`, JSON.stringify({
      "version": "0.2",
      "language": "en",
      "words": [
        "ngx",
        "mfe",
        "microfrontend",
        "esbuild",
        "tslib",
        "rxjs",
        "jsdom"
      ],
      "ignorePaths": [
        "node_modules",
        "dist",
        "*.js",
        "*.js.map",
        "*.d.ts",
        "package-lock.json",
        "coverage"
      ]
    }, null, 2), options.force);

    createOrOverwrite(tree, `${options.name}/.editorconfig`, `root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
end_of_line = lf

[*.md]
max_line_length = off
trim_trailing_whitespace = false
`, options.force);

    return tree;
  };
}
