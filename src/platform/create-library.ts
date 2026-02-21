import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function createLibrary(options: Schema): Rule {
  return (tree: Tree) => {
    const libPath = `${options.name}/src/lib`;
    
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
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '../config/config.service';

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

    const amountDescriptorPipe = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amountDescriptor',
  standalone: true
})
export class AmountDescriptorPipe implements PipeTransform {
  transform(value: number): string {
    if (!value || value === 0) return '0';
    if (value < 0) return 'Negative ' + this.formatAmount(Math.abs(value));
    return this.formatAmount(value);
  }

  private formatAmount(value: number): string {
    if (value >= 1000000000000) return (value / 1000000000000).toFixed(2) + ' Trillion';
    if (value >= 1000000000) return (value / 1000000000).toFixed(2) + ' Billion';
    if (value >= 1000000) return (value / 1000000).toFixed(2) + ' Million';
    if (value >= 1000) return (value / 1000).toFixed(2) + ' Thousand';
    if (value >= 100) return (value / 100).toFixed(2) + ' Hundred';
    return value.toString();
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
    tree.create(`${libPath}/core/services/config/config.service.ts`, configService);
    tree.create(`${libPath}/core/services/base/base.service.ts`, baseService);
    tree.create(`${libPath}/core/services/notification/notification.service.ts`, notificationService);
    tree.create(`${libPath}/core/services/index.ts`, `export * from './config/config.service';\nexport * from './base/base.service';\nexport * from './notification/notification.service';`);
    
    tree.create(`${libPath}/core/validators/custom-validators/custom-validators.ts`, customValidators);
    tree.create(`${libPath}/core/validators/index.ts`, `export * from './custom-validators/custom-validators';`);
    
    tree.create(`${libPath}/core/directives/highlight/highlight.directive.ts`, highlightDirective);
    tree.create(`${libPath}/core/directives/index.ts`, `export * from './highlight/highlight.directive';`);
    
    tree.create(`${libPath}/core/pipes/truncate/truncate.pipe.ts`, truncatePipe);
    tree.create(`${libPath}/core/pipes/capitalize/capitalize.pipe.ts`, capitalizePipe);
    tree.create(`${libPath}/core/pipes/amount-descriptor/amount-descriptor.pipe.ts`, amountDescriptorPipe);
    tree.create(`${libPath}/core/pipes/index.ts`, `export * from './truncate/truncate.pipe';\nexport * from './capitalize/capitalize.pipe';\nexport * from './amount-descriptor/amount-descriptor.pipe';`);
    tree.create(`${libPath}/core/core.module.ts`, coreModule);
    tree.create(`${libPath}/core/index.ts`, `export * from './services';\nexport * from './validators';\nexport * from './directives';\nexport * from './pipes';\nexport * from './core.module';`);
    
    // Create data library for shared state
    const dataService = `import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SharedData {
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private dataStore = new BehaviorSubject<SharedData>({});
  public data$ = this.dataStore.asObservable();

  setData(key: string, value: any): void {
    this.dataStore.next({ ...this.dataStore.value, [key]: value });
  }

  getData(key: string): any {
    return this.dataStore.value[key];
  }
}`;

    const authService = `import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  login(user: User): void {
    this.userSubject.next(user);
  }

  logout(): void {
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }
}`;

    tree.create(`${libPath}/data/data-service/data.service.ts`, dataService);
    tree.create(`${libPath}/data/auth-service/auth.service.ts`, authService);
    tree.create(`${libPath}/data/index.ts`, `export * from './data-service/data.service';\nexport * from './auth-service/auth.service';`);
    tree.create(`${libPath}/data/package.json`, JSON.stringify({ name: '@ngx-mfe/data', version: '1.0.0', main: 'index.ts' }, null, 2));
    
    // Create template library structure
    tree.create(`${libPath}/template/header/header.component.ts`, headerComponent);
    tree.create(`${libPath}/template/footer/footer.component.ts`, footerComponent);
    tree.create(`${libPath}/template/index.ts`, `export * from './header/header.component';\nexport * from './footer/footer.component';`);
    tree.create(`${libPath}/template/package.json`, JSON.stringify({ name: '@ngx-mfe/template', version: '1.0.0', main: 'index.ts' }, null, 2));
    
    // Main library public API
    const publicApi = `export * from './core';`;
    tree.create(`${libPath}/public-api.ts`, publicApi);
    tree.create(`${libPath}/core/package.json`, JSON.stringify({ name: '@ngx-mfe/core', version: '1.0.0', main: 'index.ts' }, null, 2));

    // Library package.json
    const libPackageJson = {
      name: '@ngx-mfe/shared',
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
        url: 'https://github.com/ngx-mfe/platform.git'
      },
      files: ['dist'],
      peerDependencies: {
        '@angular/core': '^21.0.0',
        '@angular/common': '^21.0.0',
        '@angular/forms': '^21.0.0',
        '@angular/material': '^21.0.0',
        '@angular/router': '^21.0.0',
        rxjs: '^7.8.0'
      },
      devDependencies: {
        '@angular/core': '^21.0.0',
        '@angular/common': '^21.0.0',
        '@angular/forms': '^21.0.0',
        '@angular/material': '^21.0.0',
        '@angular/router': '^21.0.0',
        rxjs: '^7.8.0',
        typescript: '~5.9.2'
      }
    };
    tree.create(`${libPath}/package.json`, JSON.stringify(libPackageJson, null, 2));

    // Library tsconfig
    const libTsConfig = {
      extends: '../../tsconfig.json',
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
    tree.create(`${libPath}/tsconfig.lib.json`, JSON.stringify(libTsConfig, null, 2));

    // Library README
    const libReadme = `# MFE Shared Library

Shared library for MFE and Platform applications.

## Development Workflow

### 1. Make Changes to Library
Edit files in \`src/lib/\` folder:
- Services: \`src/lib/core/services/\`
- Validators: \`src/lib/core/validators/\`
- Directives: \`src/lib/core/directives/\`
- Pipes: \`src/lib/core/pipes/\`
- Components: \`src/lib/template/\`

### 2. Build Library Locally
\`\`\`bash
cd src/lib
npm run build
\`\`\`

### 3. Publish to GitHub
Commit and push your changes:
\`\`\`bash
git add .
git commit -m "Update library"
git push
\`\`\`

GitHub Actions will automatically:
- Build the library
- Bump the version
- Publish to GitHub Packages

### 4. Install in MFE/Platform Projects
\`\`\`bash
npm install @ngx-mfe/shared@latest
\`\`\`

## Usage

\`\`\`typescript
import { ConfigService, BaseService } from '@ngx-mfe/shared';
import { DataService, AuthService } from '@ngx-mfe/shared';
import { HeaderComponent, FooterComponent } from '@ngx-mfe/shared';
\`\`\`
`;
    tree.create(`${libPath}/README.md`, libReadme);

    // GitHub Actions workflow
    const githubWorkflow = `name: Publish MFE Library

on:
  push:
    paths:
      - 'src/lib/**'
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@ngx-mfe'
      
      - name: Configure package name
        working-directory: ./src/lib
        run: |
          npm pkg set name="@ngx-mfe/shared"
      
      - name: Install dependencies
        working-directory: ./src/lib
        run: npm install
      
      - name: Build library
        working-directory: ./src/lib
        run: npm run build
      
      - name: Bump version
        working-directory: ./src/lib
        run: npm version patch --no-git-tag-version
      
      - name: Publish to GitHub Packages
        working-directory: ./src/lib
        run: npm publish
        env:
          NODE_AUTH_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;
    tree.create(`${options.name}/.github/workflows/publish-lib.yml`, githubWorkflow);

    // .npmrc for consuming the library
    const npmrc = `@ngx-mfe:registry=https://npm.pkg.github.com`;
    tree.create(`${options.name}/.npmrc`, npmrc);

    return tree;
  };
}