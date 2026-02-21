"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLibrary = createLibrary;
function createLibrary(options) {
    return (tree) => {
        const libName = 'shared-lib';
        // Core library services
        const configService = `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  environment: string;
  features: {
    enableNotifications: boolean;
    enableLogging: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>('/assets/appSettings.json')
      .pipe(
        tap(config => this.configSubject.next(config))
      );
  }

  getConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  get apiUrl(): string {
    return this.getConfig()?.apiUrl || 'http://localhost:3000/api';
  }

  get appName(): string {
    return this.getConfig()?.appName || 'Platform App';
  }

  get version(): string {
    return this.getConfig()?.version || '1.0.0';
  }
}`;
        const baseService = `import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private configService: ConfigService
  ) {}

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const url = \`\${this.configService.apiUrl}/\${endpoint}\`;
    return this.http.get<T>(url, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const url = \`\${this.configService.apiUrl}/\${endpoint}\`;
    return this.http.post<T>(url, data, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const url = \`\${this.configService.apiUrl}/\${endpoint}\`;
    return this.http.put<T>(url, data, this.getHttpOptions())
      .pipe(catchError(this.handleError.bind(this)));
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = \`\${this.configService.apiUrl}/\${endpoint}\`;
    return this.http.delete<T>(url)
      .pipe(catchError(this.handleError.bind(this)));
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  private handleError(error: any): Observable<never> {
    this.notificationService.showError('Request failed: ' + error.message);
    return throwError(error);
  }
}`;
        const notificationService = `import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showError(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}`;
        const customValidators = `import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static emailDomain(domain: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const email = control.value;
      if (email.includes('@') && !email.endsWith('@' + domain)) {
        return { emailDomain: { requiredDomain: domain, actualValue: email } };
      }
      return null;
    };
  }

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = control.value;
      const hasNumber = /[0-9]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasSpecial = /[#?!@$%^&*-]/.test(value);
      const valid = hasNumber && hasUpper && hasLower && hasSpecial && value.length >= 8;
      
      if (!valid) {
        return { strongPassword: true };
      }
      return null;
    };
  }

  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const isWhitespace = (control.value || '').trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    };
  }
}`;
        const highlightDirective = `import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = '#yellow';
  @Input() defaultColor = 'transparent';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.appHighlight);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(this.defaultColor);
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}`;
        const truncatePipe = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, trail: string = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}`;
        const capitalizePipe = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}`;
        const coreModule = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseService, NotificationService, ConfigService } from './services';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatSnackBarModule
  ],
  providers: [
    BaseService,
    NotificationService,
    ConfigService
  ]
})
export class CoreModule {}`;
        // Header component
        const headerComponent = `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, RouterModule],
  template: \`
    <mat-toolbar color="primary" class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <mat-icon class="logo-icon">{{logoIcon}}</mat-icon>
          <span class="app-title">{{appTitle}}</span>
        </div>
        
        <nav class="nav-section">
          <ng-content select="[slot=navigation]"></ng-content>
        </nav>
        
        <div class="user-section">
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item>
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item>
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item>
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  \`,
  styles: [\`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .logo-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .app-title {
      font-size: 20px;
      font-weight: 500;
    }
    
    .nav-section {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    
    .user-section {
      display: flex;
      align-items: center;
    }
    
    @media (max-width: 768px) {
      .header-content {
        padding: 0 8px;
      }
      
      .app-title {
        font-size: 16px;
      }
      
      .nav-section {
        display: none;
      }
    }
  \`]
})
export class HeaderComponent {
  @Input() appTitle = 'Platform App';
  @Input() logoIcon = 'business';
}`;
        // Footer component
        const footerComponent = `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lib-footer',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  template: \`
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <div class="company-info">
            <span class="company-name">{{companyName}}</span>
            <span class="copyright">© {{currentYear}} All rights reserved.</span>
          </div>
        </div>
        
        <div class="footer-section">
          <div class="links">
            <button mat-button class="footer-link">Privacy Policy</button>
            <button mat-button class="footer-link">Terms of Service</button>
            <button mat-button class="footer-link">Contact</button>
          </div>
        </div>
        
        <div class="footer-section">
          <div class="version-info">
            <span class="version">Version {{version}}</span>
          </div>
        </div>
      </div>
    </footer>
  \`,
  styles: [\`
    .app-footer {
      background-color: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      margin-top: auto;
    }
    
    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px;
      min-height: 60px;
    }
    
    .footer-section {
      display: flex;
      align-items: center;
    }
    
    .company-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .company-name {
      font-weight: 500;
      color: #333;
    }
    
    .copyright {
      font-size: 12px;
      color: #666;
    }
    
    .links {
      display: flex;
      gap: 8px;
    }
    
    .footer-link {
      color: #666;
      font-size: 14px;
    }
    
    .version {
      font-size: 12px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
      
      .links {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  \`]
})
export class FooterComponent {
  @Input() companyName = 'Your Company';
  @Input() version = '1.0.0';
  
  get currentYear(): number {
    return new Date().getFullYear();
  }
}`;
        // Create core library structure
        tree.create(`${options.name}/src/lib/${libName}/core/services/config.service.ts`, configService);
        tree.create(`${options.name}/src/lib/${libName}/core/services/base.service.ts`, baseService);
        tree.create(`${options.name}/src/lib/${libName}/core/services/notification.service.ts`, notificationService);
        tree.create(`${options.name}/src/lib/${libName}/core/services/index.ts`, `export * from './config.service';\nexport * from './base.service';\nexport * from './notification.service';`);
        tree.create(`${options.name}/src/lib/${libName}/core/validators/custom-validators.ts`, customValidators);
        tree.create(`${options.name}/src/lib/${libName}/core/validators/index.ts`, `export * from './custom-validators';`);
        tree.create(`${options.name}/src/lib/${libName}/core/directives/highlight.directive.ts`, highlightDirective);
        tree.create(`${options.name}/src/lib/${libName}/core/directives/index.ts`, `export * from './highlight.directive';`);
        tree.create(`${options.name}/src/lib/${libName}/core/pipes/truncate.pipe.ts`, truncatePipe);
        tree.create(`${options.name}/src/lib/${libName}/core/pipes/capitalize.pipe.ts`, capitalizePipe);
        tree.create(`${options.name}/src/lib/${libName}/core/pipes/index.ts`, `export * from './truncate.pipe';\nexport * from './capitalize.pipe';`);
        tree.create(`${options.name}/src/lib/${libName}/core/core.module.ts`, coreModule);
        // Create template library structure
        tree.create(`${options.name}/src/lib/${libName}/template/header/header.component.ts`, headerComponent);
        tree.create(`${options.name}/src/lib/${libName}/template/footer/footer.component.ts`, footerComponent);
        tree.create(`${options.name}/src/lib/${libName}/template/index.ts`, `export * from './header/header.component';\nexport * from './footer/footer.component';`);
        // Main library public API
        const publicApi = `export * from './core/services';\nexport * from './core/validators';\nexport * from './core/directives';\nexport * from './core/pipes';\nexport * from './core/core.module';\nexport * from './template';`;
        tree.create(`${options.name}/src/lib/${libName}/public-api.ts`, publicApi);
        // Library package.json
        const libPackageJson = {
            name: '@tarikul-islam-soikot/mfe-shared-lib',
            version: '1.0.0',
            description: 'Shared library for MFE and Platform applications',
            main: 'dist/public-api.js',
            types: 'dist/public-api.d.ts',
            scripts: {
                build: 'tsc -p tsconfig.lib.json',
                prepublishOnly: 'npm run build'
            },
            keywords: ['mfe', 'shared', 'angular'],
            author: 'Tarikul Islam Soikot <tarikulsoikot@gmail.com>',
            license: 'MIT',
            repository: {
                type: 'git',
                url: 'https://github.com/Tarikul-Islam-Soikot/mfe-shared-lib.git'
            },
            files: ['dist'],
            peerDependencies: {
                '@angular/core': '^21.0.0',
                '@angular/common': '^21.0.0',
                rxjs: '^7.8.0'
            },
            devDependencies: {
                '@angular/core': '^21.0.0',
                '@angular/common': '^21.0.0',
                rxjs: '^7.8.0',
                typescript: '~5.9.2'
            }
        };
        tree.create(`${options.name}/src/lib/${libName}/package.json`, JSON.stringify(libPackageJson, null, 2));
        // Library tsconfig
        const libTsConfig = {
            extends: '../../../tsconfig.json',
            compilerOptions: {
                outDir: './dist',
                declaration: true,
                declarationMap: true,
                module: 'ES2022',
                target: 'ES2022'
            },
            include: ['**/*.ts'],
            exclude: ['**/*.spec.ts', 'dist']
        };
        tree.create(`${options.name}/src/lib/${libName}/tsconfig.lib.json`, JSON.stringify(libTsConfig, null, 2));
        // GitHub Actions workflow
        const githubWorkflow = `name: Publish Shared Library

on:
  push:
    paths:
      - 'src/lib/shared-lib/**'
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@tarikul-islam-soikot'
      
      - name: Install dependencies
        working-directory: ./src/lib/shared-lib
        run: npm install
      
      - name: Build library
        working-directory: ./src/lib/shared-lib
        run: npm run build
      
      - name: Bump version
        working-directory: ./src/lib/shared-lib
        run: npm version patch --no-git-tag-version
      
      - name: Publish to GitHub Packages
        working-directory: ./src/lib/shared-lib
        run: npm publish
        env:
          NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;
        tree.create(`${options.name}/.github/workflows/publish-lib.yml`, githubWorkflow);
        // .npmrc for consuming the library
        const npmrc = `@tarikul-islam-soikot:registry=https://npm.pkg.github.com`;
        tree.create(`${options.name}/.npmrc`, npmrc);
        return tree;
    };
}
//# sourceMappingURL=create-library.js.map