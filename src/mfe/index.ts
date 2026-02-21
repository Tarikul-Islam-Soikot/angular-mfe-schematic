import { Rule, Tree, chain } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { addAngularMaterial } from './add-material';
import { setupJest } from './setup-jest';
import { setupModuleFederation } from './setup-module-federation';
import { createUserComponents } from './create-components';
import { createTests } from './create-tests';
import { addLintAndFormat } from './add-lint-format';
import { createOrOverwrite } from '../utils';

export function mfeApp(options: Schema): Rule {
  return chain([
    createWorkspaceFiles(options),
    createMfeApp(options),
    addAngularMaterial(options),
    setupJest(options),
    setupModuleFederation(options),
    createUserComponents(options),
    createTests(options),
    addLintAndFormat(options)
  ]);
}

function createWorkspaceFiles(options: Schema): Rule {
  return (tree: Tree) => {
    createOrOverwrite(tree, `${options.name}/angular.json`, JSON.stringify({
      "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
      "version": 1,
      "newProjectRoot": "projects",
      "projects": {
        [options.name]: {
          "projectType": "application",
          "schematics": {
            "@schematics/angular:component": {
              "style": "scss"
            }
          },
          "root": "",
          "sourceRoot": "src",
          "prefix": "app",
          "architect": {
            "build": {
              "builder": "@angular-architects/native-federation:build",
              "options": {},
              "configurations": {
                "production": {
                  "target": options.name + ":esbuild:production"
                },
                "development": {
                  "target": options.name + ":esbuild:development",
                  "dev": true
                }
              },
              "defaultConfiguration": "production"
            },
            "serve": {
              "builder": "@angular-architects/native-federation:build",
              "options": {
                "target": options.name + ":serve-original:development",
                "rebuildDelay": 500,
                "dev": true,
                "port": 0
              }
            },
            "esbuild": {
              "builder": "@angular/build:application",
              "options": {
                "outputPath": "dist/" + options.name,
                "index": "src/index.html",
                "tsConfig": "tsconfig.app.json",
                "assets": ["src/favicon.ico", "src/assets"],
                "styles": ["src/styles.scss"],
                "scripts": [],
                "polyfills": ["es-module-shims"],
                "browser": "src/main.ts"
              },
              "configurations": {
                "production": {
                  "budgets": [
                    {
                      "type": "initial",
                      "maximumWarning": "500kB",
                      "maximumError": "1MB"
                    }
                  ],
                  "outputHashing": "all"
                },
                "development": {
                  "optimization": false,
                  "extractLicenses": false,
                  "sourceMap": true
                }
              },
              "defaultConfiguration": "production"
            },
            "serve-original": {
              "builder": "@angular-devkit/build-angular:dev-server",
              "configurations": {
                "production": {
                  "buildTarget": options.name + ":esbuild:production"
                },
                "development": {
                  "buildTarget": options.name + ":esbuild:development"
                }
              },
              "defaultConfiguration": "development",
              "options": {
                "port": options.port || 4201
              }
            }
          }
        }
      }
    }, null, 2), options.force);

    createOrOverwrite(tree, `${options.name}/package.json`, JSON.stringify({
      "name": options.name,
      "version": "0.0.0",
      "scripts": {
        "ng": "ng",
        "start": "ng serve",
        "build": "ng build",
        "test": "jest",
        "lint": "ng lint",
        "lint:fix": "ng lint --fix",
        "format": "prettier --write \"src/**/*.{ts,html,scss}\"",
        "format:check": "prettier --check \"src/**/*.{ts,html,scss}\"",
        "spell": "cspell \"**/*.{ts,html,md,json}\"",
        "check": "npm run format:check && npm run lint && npm run spell",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage"
      },
      "dependencies": {
        "@angular-architects/native-federation": "^21.0.3",
        "@angular/animations": "^21.0.0",
        "@angular/cdk": "^21.0.0",
        "@angular/common": "^21.0.0",
        "@angular/compiler": "^21.0.0",
        "@angular/core": "^21.0.0",
        "@angular/forms": "^21.0.0",
        "@angular/material": "^21.0.0",
        "@angular/platform-browser": "^21.0.0",
        "@angular/platform-browser-dynamic": "^21.0.0",
        "@angular/router": "^21.0.0",
        "es-module-shims": "^2.8.0",
        "rxjs": "~7.8.0",
        "tslib": "^2.3.0",
        "zone.js": "~0.15.0"
      },
      "devDependencies": {
        "@angular-devkit/build-angular": "^21.0.0",
        "@angular-eslint/builder": "^18.0.0",
        "@angular-eslint/eslint-plugin": "^18.0.0",
        "@angular-eslint/eslint-plugin-template": "^18.0.0",
        "@angular-eslint/schematics": "^18.0.0",
        "@angular-eslint/template-parser": "^18.0.0",
        "@angular/build": "^21.1.2",
        "@angular/cli": "^21.0.0",
        "@angular/compiler-cli": "^21.0.0",
        "@oxc-parser/binding-win32-x64-msvc": "^0.112.0",
        "@types/jest": "^29.0.0",
        "@typescript-eslint/eslint-plugin": "^8.0.0",
        "@typescript-eslint/parser": "^8.0.0",
        "cspell": "^8.0.0",
        "eslint": "^9.0.0",
        "eslint-config-prettier": "^9.0.0",
        "jest": "^30.0.0",
        "jest-environment-jsdom": "^30.0.0",
        "jest-preset-angular": "^16.0.0",
        "prettier": "^3.0.0",
        "typescript": "~5.9.0"
      }
    }, null, 2), options.force);

    createOrOverwrite(tree, `${options.name}/tsconfig.json`, JSON.stringify({
      "compileOnSave": false,
      "compilerOptions": {
        "baseUrl": "./",
        "outDir": "./dist/out-tsc",
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "noImplicitOverride": true,
        "noPropertyAccessFromIndexSignature": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "sourceMap": true,
        "declaration": false,
        "downlevelIteration": true,
        "experimentalDecorators": true,
        "moduleResolution": "bundler",
        "importHelpers": true,
        "target": "ES2022",
        "module": "ES2022",
        "useDefineForClassFields": false,
        "lib": ["ES2022", "dom"]
      },
      "angularCompilerOptions": {
        "enableI18nLegacyMessageIdFormat": false,
        "strictInjectionParameters": true,
        "strictInputAccessModifiers": true,
        "strictTemplates": true
      }
    }, null, 2), options.force);

    createOrOverwrite(tree, `${options.name}/tsconfig.app.json`, JSON.stringify({
      "extends": "./tsconfig.json",
      "compilerOptions": {
        "outDir": "./out-tsc/app",
        "types": []
      },
      "files": [
        "src/main.ts",
        "src/bootstrap.ts",
        "src/app/modules/demo/demo.module.ts"
      ],
      "include": [
        "src/**/*.ts",
        "src/**/*.d.ts"
      ],
      "exclude": [
        "src/**/*.spec.ts"
      ]
    }, null, 2), options.force);

    return tree;
  };
}

function createMfeApp(options: Schema): Rule {
  return (tree: Tree) => {
    createOrOverwrite(tree, `${options.name}/src/bootstrap.ts`, `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
`, options.force);

    createOrOverwrite(tree, `${options.name}/src/main.ts`, `import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
`, options.force);

    createOrOverwrite(tree, `${options.name}/src/index.html`, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${options.name}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body class="mat-typography">
  <app-root></app-root>
</body>
</html>
`, options.force);

    createOrOverwrite(tree, `${options.name}/src/styles.scss`, `@import '@angular/material/prebuilt-themes/indigo-pink.css';

html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }
`, options.force);

    createOrOverwrite(tree, `${options.name}/src/app/app.component.ts`, `import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: \`
    <mat-toolbar color="primary">
      <span>${options.name}</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/users">Users</button>
    </mat-toolbar>
    <router-outlet></router-outlet>
  \`,
  styles: [\`.spacer { flex: 1 1 auto; }\`]
})
export class AppComponent {}
`, options.force);

    createOrOverwrite(tree, `${options.name}/src/app/app.config.ts`, `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations()
  ]
};
`, options.force);

    createOrOverwrite(tree, `${options.name}/src/app/app.routes.ts`, `import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { CreateOrEditUserComponent } from './components/create-or-edit-user/create-or-edit-user.component';

export const routes: Routes = [
  { path: '', component: UserListComponent },
  { path: 'add', component: CreateOrEditUserComponent },
  { path: 'edit/:id', component: CreateOrEditUserComponent }
];
`, options.force);

    return tree;
  };
}

