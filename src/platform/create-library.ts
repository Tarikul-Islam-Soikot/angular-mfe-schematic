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
  static minLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length === 0) return null;
      return control.value.length < min ? { minLength: { requiredLength: min, actualLength: control.value.length } } : null;
    };
  }

  static maxLength(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value.length > max ? { maxLength: { requiredLength: max, actualLength: control.value.length } } : null;
    };
  }

  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const phoneRegex = /^[0-9]{10}$/;
      return phoneRegex.test(control.value) ? null : { phoneNumber: true };
    };
  }

  static ageRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const age = Number(control.value);
      return age >= min && age <= max ? null : { ageRange: { min, max, actual: age } };
    };
  }

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

  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const urlRegex = /^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w-./?%&=]*)?$/;
      return urlRegex.test(control.value) ? null : { url: true };
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
    if (value < 1) return value.toFixed(3);
    
    const parts: string[] = [];
    let remaining = Math.floor(value);
    
    // Trillions
    if (remaining >= 1000000000000) {
      const trillions = Math.floor(remaining / 1000000000000);
      parts.push(\`\${trillions} trillion\`);
      remaining = remaining % 1000000000000;
    }
    
    // Billions
    if (remaining >= 1000000000) {
      const billions = Math.floor(remaining / 1000000000);
      parts.push(\`\${billions} billion\`);
      remaining = remaining % 1000000000;
    }
    
    // Millions
    if (remaining >= 1000000) {
      const millions = Math.floor(remaining / 1000000);
      parts.push(\`\${millions} million\`);
      remaining = remaining % 1000000;
    }
    
    // Thousands
    if (remaining >= 1000) {
      const thousands = Math.floor(remaining / 1000);
      parts.push(\`\${thousands} thousand\`);
      remaining = remaining % 1000;
    }
    
    // Hundreds
    if (remaining >= 100) {
      const hundreds = Math.floor(remaining / 100);
      parts.push(\`\${hundreds} hundred\`);
      remaining = remaining % 100;
    }
    
    // Remaining units
    if (remaining > 0) {
      parts.push(remaining.toString());
    }
    
    // Handle decimal part
    const decimalPart = value - Math.floor(value);
    if (decimalPart > 0) {
      const decimalStr = decimalPart.toFixed(3).substring(2); // Remove "0."
      if (parseInt(decimalStr) > 0) {
        const digits = decimalStr.split('').join(' ');
        parts.push(\`point \${digits}\`);
      }
    }
    
    return parts.length > 0 ? parts.join(' ') : '0';
  }
}`;

    const customDateFormatPipe = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDateFormat',
  standalone: true
})
export class CustomDateFormatPipe implements PipeTransform {
  transform(value: Date | string | null, format: string = 'dd/MM/yyyy'): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[date.getMonth()];

    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('MMM', monthName)
      .replace('yyyy', String(year));
  }
}`;

    const titleCasePipe = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleCase',
  standalone: true
})
export class TitleCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}`;

    const lowerCasePipe = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lowerCase',
  standalone: true
})
export class LowerCasePipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.toLowerCase() : '';
  }
}`;

    const upperCasePipe = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upperCase',
  standalone: true
})
export class UpperCasePipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.toUpperCase() : '';
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

    // Create models
    const fieldConfigModel = `import { Observable } from 'rxjs';\nimport { PipeTransform, Type } from '@angular/core';\n\nexport enum FieldType {\n  Text = 'text',\n  Email = 'email',\n  Number = 'number',\n  Date = 'date',\n  Textarea = 'textarea',\n  Select = 'select',\n  Radio = 'radio',\n  Checkbox = 'checkbox',\n  Autocomplete = 'autocomplete',\n  FormArray = 'formarray'\n}\n\nexport enum RadioLayout {\n  Horizontal = 'horizontal',\n  Vertical = 'vertical'\n}\n\nexport interface BaseFieldConfig {\n  name: string;\n  label: string;\n  required?: boolean;\n  validators?: any[];\n  hint?: string;\n  colSpan?: number;\n  hooks?: { [hookName: string]: (value: any, formValue: any, form: any) => void };\n  errorMessages?: { [errorKey: string]: string };\n  customClass?: string;\n  customStyle?: { [key: string]: string };\n  newRow?: boolean;\n  pipes?: Type<PipeTransform>[];\n}\n\nexport interface TextFieldConfig extends BaseFieldConfig {\n  type: FieldType.Text | FieldType.Email;\n}\n\nexport interface NumberFieldConfig extends BaseFieldConfig {\n  type: FieldType.Number;\n  step?: string;\n  min?: number;\n  max?: number;\n}\n\nexport interface TextareaFieldConfig extends BaseFieldConfig {\n  type: FieldType.Textarea;\n  rows?: number;\n}\n\nexport interface DateFieldConfig extends BaseFieldConfig {\n  type: FieldType.Date;\n  min?: Date;\n  max?: Date;\n  disabled?: boolean;\n  dateFormat?: string;\n}\n\nexport interface SelectFieldConfig extends BaseFieldConfig {\n  type: FieldType.Select;\n  options: { id: any; name: string }[];\n}\n\nexport interface RadioFieldConfig extends BaseFieldConfig {\n  type: FieldType.Radio;\n  options: { id: any; name: string }[];\n  layout?: RadioLayout;\n}\n\nexport interface CheckboxFieldConfig extends BaseFieldConfig {\n  type: FieldType.Checkbox;\n}\n\nexport interface AutocompleteFieldConfig extends BaseFieldConfig {\n  type: FieldType.Autocomplete;\n  options?: { id: any; name: string }[];\n  filteredOptions?: Observable<{ id: any; name: string }[]>;\n  displayWith: (value: any) => string;\n}\n\nexport interface FormArrayFieldConfig extends BaseFieldConfig {\n  type: FieldType.FormArray;\n  childFields: FieldConfig[];\n  addButtonLabel?: string;\n  removeButtonLabel?: string;\n  defaultEntry?: boolean;\n  showAddButton?: boolean;\n  showRemoveButton?: boolean;\n  showClearButton?: boolean;\n  buttonsPosition?: 'bottom' | 'inline';\n}\n\nexport type FieldConfig = \n  | TextFieldConfig \n  | NumberFieldConfig \n  | TextareaFieldConfig \n  | DateFieldConfig \n  | SelectFieldConfig \n  | RadioFieldConfig \n  | CheckboxFieldConfig \n  | AutocompleteFieldConfig\n  | FormArrayFieldConfig;`;

    tree.create(`${libPath}/core/models/field-config.model.ts`, fieldConfigModel);
    tree.create(`${libPath}/core/models/index.ts`, `export * from './field-config.model';`);

    // Dynamic Form Component
    const dynamicFormComponentTs = `import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FieldConfig, FieldType } from '../../models';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CustomDateFormatPipe } from '../../pipes/custom-date-format/custom-date-format.pipe';

const enum HookType {
  OnBlur = 'onBlur',
  OnFocus = 'onFocus'
}

const DEFAULT_VALUES = {
  TEXT: '',
  NUMBER: 0,
  CHECKBOX: false,
  RADIO: null
} as const;

const enum MetadataKey {
  ColSpan = 'colSpan',
  Rows = 'rows',
  Required = 'required',
  Disabled = 'disabled',
  Min = 'min',
  Max = 'max',
  AddButtonLabel = 'addButtonLabel'
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatCardModule, MatIconModule, MatRadioModule, 
    MatCheckboxModule, MatSelectModule, MatAutocompleteModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FieldConfig[] = [];
  @Input() initialData: any = {};
  @Input() isEditMode = false;
  @Input() customClass: string = '';
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  private filteredOptionsMap = new Map<string, Observable<any[]>>();
  fieldMetadata = new Map<string, any>();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    const group: any = {};
    this.fields.forEach(field => {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.type === FieldType.Email) validators.push(Validators.email);
      if (field.validators) validators.push(...field.validators);
      
      if (field.type === FieldType.FormArray) {
        group[field.name] = this.fb.array([]);
      } else {
        let defaultValue: any;
        if (field.type === FieldType.Checkbox) {
          defaultValue = DEFAULT_VALUES.CHECKBOX;
        } else if (field.type === FieldType.Number) {
          defaultValue = DEFAULT_VALUES.NUMBER;
        } else if (field.type === FieldType.Radio) {
          defaultValue = DEFAULT_VALUES.RADIO;
        } else {
          defaultValue = DEFAULT_VALUES.TEXT;
        }
        const controlValue = this.initialData[field.name] ?? defaultValue;
        const isDisabled = (field as any).disabled || false;
        group[field.name] = [{ value: controlValue, disabled: isDisabled }, validators];
      }

      this.fieldMetadata.set(field.name, {
        [MetadataKey.ColSpan]: (field as any).colSpan ? (field as any).colSpan : 1,
        [MetadataKey.Rows]: (field as any).rows ? (field as any).rows : 3,
        [MetadataKey.Required]: field.required ? true : false,
        [MetadataKey.Disabled]: (field as any).disabled ? true : false,
        [MetadataKey.Min]: (field as any).min !== undefined ? (field as any).min : null,
        [MetadataKey.Max]: (field as any).max !== undefined ? (field as any).max : null,
        [MetadataKey.AddButtonLabel]: (field as any).addButtonLabel ? (field as any).addButtonLabel : 'Add'
      });
    });
    this.form = this.fb.group(group);

    this.fields.forEach(field => {
      if (field.type === FieldType.FormArray && (field as any).defaultEntry) {
        this.addFormArrayItem(field.name, (field as any).childFields);
      }
    });

    this.fields.forEach(field => {
      if (field.type === FieldType.Autocomplete) {
        if ((field as any).filteredOptions) {
          this.filteredOptionsMap.set(field.name, (field as any).filteredOptions);
        } else if ((field as any).options) {
          this.filteredOptionsMap.set(field.name, this.form.get(field.name)!.valueChanges.pipe(
            startWith(''),
            map(value => this._filter((field as any).options || [], value))
          ));
        }
      }
      
      if (field.hooks) {
        Object.keys(field.hooks).forEach(hookName => {
          this.form.get(field.name)?.valueChanges.subscribe(value => {
            field.hooks![hookName](value, this.form.value, this.form);
          });
        });
      }
    });
  }

  private _filter(options: any[], value: string): any[] {
    const filterValue = String(value).toLowerCase();
    return options.filter(opt => opt.name.toLowerCase().includes(filterValue));
  }

  getFilteredOptions(fieldName: string): Observable<any[]> {
    return this.filteredOptionsMap.get(fieldName) || new Observable();
  }

  getError(field: FieldConfig): string {
    const control = this.form.get(field.name);
    if (!control?.errors) return '';
    
    const firstErrorKey = Object.keys(control.errors)[0];
    return field.errorMessages?.[firstErrorKey] || '';
  }

  onSubmit() {
    if (this.form.valid) this.formSubmit.emit(this.form.value);
  }

  onFieldBlur(field: FieldConfig) {
    if (field.hooks?.[HookType.OnBlur]) {
      field.hooks[HookType.OnBlur](this.form.get(field.name)?.value, this.form.value, this.form);
    }
  }

  onFieldFocus(field: FieldConfig) {
    if (field.hooks?.[HookType.OnFocus]) {
      field.hooks[HookType.OnFocus](this.form.get(field.name)?.value, this.form.value, this.form);
    }
  }

  onFieldInput(field: FieldConfig) {
    this.form.get(field.name)?.markAsTouched();
  }

  getChildError(childField: FieldConfig, arrayName: string, index: number): string {
    const control = this.getFormArrayControl(arrayName, index, childField.name);
    if (!control?.errors) return '';
    
    const firstErrorKey = Object.keys(control.errors)[0];
    return childField.errorMessages?.[firstErrorKey] || '';
  }

  getFormArray(fieldName: string): FormArray {
    return this.form.get(fieldName) as FormArray;
  }

  getFormArrayControl(fieldName: string, index: number, controlName: string): any {
    return this.getFormArray(fieldName).at(index).get(controlName);
  }

  addFormArrayItem(fieldName: string, childFields: any[]) {
    const group: any = {};
    childFields.forEach(field => {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.validators) validators.push(...field.validators);
      const defaultValue = field.type === FieldType.Number ? 0 : '';
      group[field.name] = [defaultValue, validators];
    });
    this.getFormArray(fieldName).push(this.fb.group(group));
  }

  removeFormArrayItem(fieldName: string, index: number) {
    this.getFormArray(fieldName).removeAt(index);
  }

  clearFormArrayItem(fieldName: string, index: number, childFields: any[]) {
    const group = this.getFormArray(fieldName).at(index) as FormGroup;
    childFields.forEach(field => {
      const defaultValue = field.type === FieldType.Number ? 0 : '';
      group.get(field.name)?.setValue(defaultValue);
      group.get(field.name)?.markAsUntouched();
    });
  }

  canRemoveFormArrayItem(fieldName: string): boolean {
    return this.getFormArray(fieldName).length > 1;
  }

  applyPipe(value: any, pipeTypes: any[], field?: any): any {
    if (field?.type === FieldType.Date && field?.dateFormat) {
      const pipeInstance = new CustomDateFormatPipe();
      return pipeInstance.transform(value, field.dateFormat);
    }
    if (!pipeTypes || pipeTypes.length === 0) return value;
    return pipeTypes.reduce((acc, PipeType) => {
      const pipeInstance = new PipeType();
      return pipeInstance.transform(acc);
    }, value);
  }

  getFieldValue(fieldName: string, pipes: any[] | undefined, field?: any): any {
    const value = this.form.get(fieldName)?.value;
    return this.applyPipe(value, pipes ? pipes : [], field);
  }

  getChildFieldValue(fieldName: string, index: number, controlName: string, pipes: any[] | undefined): any {
    const value = this.getFormArrayControl(fieldName, index, controlName)?.value;
    return this.applyPipe(value, pipes ? pipes : []);
  }

  getColSpan(field: any): number {
    return this.fieldMetadata.get(field.name)?.[MetadataKey.ColSpan];
  }

  getRows(field: any): number {
    return this.fieldMetadata.get(field.name)?.[MetadataKey.Rows];
  }

  isRequired(field: any): boolean {
    return this.fieldMetadata.get(field.name)?.[MetadataKey.Required];
  }

  isDisabled(field: any): boolean {
    return this.fieldMetadata.get(field.name)?.[MetadataKey.Disabled];
  }

  getMin(field: any): any {
    return this.fieldMetadata.get(field.name)?.[MetadataKey.Min];
  }

  getMax(field: any): any {
    return this.fieldMetadata.get(field.name)?.[MetadataKey.Max];
  }

  getAddButtonLabel(field: any): string {
    return this.fieldMetadata.get(field.name)?.[MetadataKey.AddButtonLabel];
  }
}
`;
    const dynamicFormComponentHtml = `<mat-card [ngClass]="customClass">
  <mat-card-content>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dynamic-form">
      <div class="form-grid">
        <ng-container *ngFor="let field of fields">
          
          <mat-form-field *ngIf="field.type === 'text' || field.type === 'email'" appearance="outline" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)">
            <mat-label>{{field.label}}</mat-label>
            <input matInput [formControlName]="field.name" [type]="field.type" [required]="isRequired(field)"
              [value]="getFieldValue(field.name, field.pipes, field)"
              (blur)="onFieldBlur(field)" (focus)="onFieldFocus(field)" (input)="onFieldInput(field)">
            <mat-error *ngIf="form.get(field.name)?.invalid">{{getError(field)}}</mat-error>
          </mat-form-field>

          <mat-form-field *ngIf="field.type === 'number'" appearance="outline" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)">
            <mat-label>{{field.label}}</mat-label>
            <input matInput [formControlName]="field.name" type="number" [step]="field.step" [min]="getMin(field)" [max]="getMax(field)" [required]="isRequired(field)"
              (blur)="onFieldBlur(field)" (focus)="onFieldFocus(field)" (input)="onFieldInput(field)">
            <mat-hint *ngIf="field.hint">{{field.hint}}</mat-hint>
            <mat-error *ngIf="form.get(field.name)?.invalid">{{getError(field)}}</mat-error>
          </mat-form-field>

          <mat-form-field *ngIf="field.type === 'textarea'" appearance="outline" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)">
            <mat-label>{{field.label}}</mat-label>
            <textarea matInput [formControlName]="field.name" [rows]="getRows(field)"
              [value]="getFieldValue(field.name, field.pipes, field)"
              (blur)="onFieldBlur(field)" (focus)="onFieldFocus(field)" (input)="onFieldInput(field)"></textarea>
            <mat-error *ngIf="form.get(field.name)?.invalid">{{getError(field)}}</mat-error>
          </mat-form-field>

          <mat-form-field *ngIf="field.type === 'date'" appearance="outline" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)">
            <mat-label>{{field.label}}</mat-label>
            <input matInput [matDatepicker]="picker" [formControlName]="field.name" [min]="field.min" [max]="field.max">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-hint *ngIf="form.get(field.name)?.value">{{getFieldValue(field.name, field.pipes, field)}}</mat-hint>
            <mat-error *ngIf="form.get(field.name)?.invalid && form.get(field.name)?.touched">{{getError(field)}}</mat-error>
          </mat-form-field>

          <mat-form-field *ngIf="field.type === 'select'" appearance="outline" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)">
            <mat-label>{{field.label}}</mat-label>
            <mat-select [formControlName]="field.name">
              <mat-option *ngFor="let opt of field.options" [value]="opt.id">{{opt.name}}</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get(field.name)?.invalid && form.get(field.name)?.touched">{{getError(field)}}</mat-error>
          </mat-form-field>

          <mat-form-field *ngIf="field.type === 'autocomplete'" appearance="outline" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)">
            <mat-label>{{field.label}}</mat-label>
            <input matInput [formControlName]="field.name" [matAutocomplete]="auto" [required]="isRequired(field)" (input)="onFieldInput(field)">
            <mat-autocomplete #auto="matAutocomplete" [displayWith]="field.displayWith">
              <mat-option *ngFor="let opt of getFilteredOptions(field.name) | async" [value]="opt">{{opt.name}}</mat-option>
            </mat-autocomplete>
            <mat-error *ngIf="form.get(field.name)?.invalid">{{getError(field)}}</mat-error>
          </mat-form-field>

          <div *ngIf="field.type === 'radio'" class="field-group" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)">
            <label class="field-label" [class.required]="field.required">{{field.label}}</label>
            <mat-radio-group [formControlName]="field.name" [ngClass]="[field.customClass, field.layout || 'horizontal']">
              <mat-radio-button *ngFor="let opt of field.options" [value]="opt.id">{{opt.name}}</mat-radio-button>
            </mat-radio-group>
            <div class="error-message" *ngIf="form.get(field.name)?.invalid && form.get(field.name)?.touched">{{getError(field)}}</div>
          </div>

          <div *ngIf="field.type === 'checkbox'" class="checkbox-wrapper" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)" [ngClass]="field.customClass">
            <mat-checkbox [formControlName]="field.name">{{field.label}}</mat-checkbox>
            <div class="error-message" *ngIf="form.get(field.name)?.invalid && form.get(field.name)?.touched">{{getError(field)}}</div>
          </div>

          <div *ngIf="field.type === 'formarray'" class="formarray-wrapper" [style.grid-column]="field.newRow ? '1 / span ' + getColSpan(field) : 'span ' + getColSpan(field)">
            <label class="field-label" [class.required]="field.required">{{field.label}}</label>
            <div *ngFor="let item of getFormArray(field.name).controls; let i = index" class="formarray-item">
              <div class="formarray-fields" [class.with-inline-button]="field.buttonsPosition === 'inline'">
                <div class="fields-container">
                  <ng-container *ngFor="let childField of field.childFields">
                    <mat-form-field *ngIf="childField.type === 'text' || childField.type === 'email'" appearance="outline" [style.--field-span]="getColSpan(childField)">
                      <mat-label>{{childField.label}}</mat-label>
                      <input matInput [formControl]="getFormArrayControl(field.name, i, childField.name)" [type]="childField.type"
                        [value]="getChildFieldValue(field.name, i, childField.name, childField.pipes)"
                        (input)="getFormArrayControl(field.name, i, childField.name).markAsTouched()">
                      <mat-error *ngIf="getFormArrayControl(field.name, i, childField.name)?.invalid">{{getChildError(childField, field.name, i)}}</mat-error>
                    </mat-form-field>
                    <mat-form-field *ngIf="childField.type === 'number'" appearance="outline" [style.--field-span]="getColSpan(childField)">
                      <mat-label>{{childField.label}}</mat-label>
                      <input matInput [formControl]="getFormArrayControl(field.name, i, childField.name)" type="number" (input)="getFormArrayControl(field.name, i, childField.name).markAsTouched()">
                      <mat-error *ngIf="getFormArrayControl(field.name, i, childField.name)?.invalid">{{getChildError(childField, field.name, i)}}</mat-error>
                    </mat-form-field>
                  </ng-container>
                </div>
                <div *ngIf="field.buttonsPosition === 'inline'" class="button-group">
                  <button *ngIf="field.showAddButton !== false" mat-icon-button type="button" (click)="addFormArrayItem(field.name, field.childFields)" class="small-button">
                    <mat-icon>add</mat-icon>
                  </button>
                  <button *ngIf="field.showClearButton !== false" mat-icon-button type="button" (click)="clearFormArrayItem(field.name, i, field.childFields)" class="small-button">
                    <mat-icon>refresh</mat-icon>
                  </button>
                  <button *ngIf="field.showRemoveButton !== false && canRemoveFormArrayItem(field.name)" mat-icon-button type="button" (click)="removeFormArrayItem(field.name, i)" class="small-button">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              <button *ngIf="field.showRemoveButton !== false && field.buttonsPosition !== 'inline' && canRemoveFormArrayItem(field.name)" mat-icon-button type="button" (click)="removeFormArrayItem(field.name, i)" class="small-button">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <button *ngIf="field.showAddButton !== false && field.buttonsPosition !== 'inline'" mat-raised-button type="button" (click)="addFormArrayItem(field.name, field.childFields)" class="small-button">
              <mat-icon>add</mat-icon>
              {{getAddButtonLabel(field)}}
            </button>
          </div>

        </ng-container>
      </div>

      <div class="form-actions">
        <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">
          <mat-icon>{{isEditMode ? 'save' : 'add'}}</mat-icon>
          {{isEditMode ? 'Update' : 'Create'}}
        </button>
        <button mat-button type="button" (click)="formCancel.emit()">
          <mat-icon>cancel</mat-icon>
          Cancel
        </button>
      </div>
    </form>
  </mat-card-content>
</mat-card>
`;

    const dynamicFormComponentScss = `.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;

  @media (min-width: 1200px) {
    gap: 20px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 16px;
  row-gap: 16px;

  @media (min-width: 1200px) {
    column-gap: 20px;
    row-gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    column-gap: 12px;
    row-gap: 12px;

    >* {
      grid-column: 1 !important;
    }
  }

  @media (max-width: 480px) {
    column-gap: 8px;
    row-gap: 8px;
  }
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;

  @media (max-width: 480px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  font-size: 14px;
}

.field-label.required::after {
  content: ' *';
  color: #f44336;
}

mat-radio-group {
  display: flex;
  flex-direction: row;
  gap: 8px;

  &.vertical {
    flex-direction: column;
    gap: 0;
  }

  &.horizontal {
    flex-direction: row;
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
}

::ng-deep mat-radio-group .mat-mdc-radio-button {
  margin: 0 !important;
}

::ng-deep mat-radio-group .mdc-radio {
  padding: 0 !important;
}

::ng-deep mat-radio-group .mdc-form-field {
  padding: 0 !important;
  margin: 0 !important;
}

::ng-deep mat-radio-group .mat-mdc-radio-button .mdc-label {
  padding-left: 4px !important;
}

::ng-deep mat-radio-group.vertical .mat-mdc-radio-button {
  padding: 4px 0 !important;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.checkbox-wrapper {
  display: flex;
  flex-direction: column;
}

.formarray-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.formarray-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: flex-start;
}

.formarray-fields {
  flex: 1;
  min-width: 0;
}

.formarray-fields.with-inline-button {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.fields-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 8px;
  row-gap: 8px;
  flex: 1;
  min-width: 0;

  mat-form-field {
    width: 100%;
  }

  @media (min-width: 769px) {
    >mat-form-field {
      grid-column: span var(--field-span, 6);
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;

    >* {
      grid-column: 1 !important;
    }
  }
}

.button-group {
  display: flex;
  gap: 2px;
}

.button-group .small-button {
  width: 40px;
  height: 40px;
  line-height: 40px;
}

.button-group .small-button mat-icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
}

.button-group .small-button:first-child {
  color: #2196f3;
}

.button-group .small-button:nth-child(2) {
  color: #009688;
}

.button-group .small-button:last-child {
  color: #f44336;
}

::ng-deep .button-group .mat-mdc-icon-button {
  padding: 8px !important;
}

::ng-deep .button-group .mat-mdc-icon-button .mat-mdc-button-touch-target {
  display: none;
}

::ng-deep .mat-mdc-form-field-required-marker {
  color: #f44336 !important;
}

::ng-deep .mat-mdc-form-field-hint-wrapper,
::ng-deep .mat-mdc-form-field-error-wrapper {
  padding: 0 !important;
}`;

    const dynamicViewComponentTs = `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FieldConfig } from '../../models';

@Component({
  selector: 'app-dynamic-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './dynamic-view.component.html',
  styleUrls: ['./dynamic-view.component.scss']
})
export class DynamicViewComponent {
  @Input() fields: FieldConfig[] = [];
  @Input() data: any = {};

  getOptionName(field: FieldConfig, value: any): string {
    if ('options' in field && field.options) {
      return field.options.find((opt: any) => opt.id === value)?.name || value;
    }
    return value;
  }
}
`;

    const dynamicViewComponentHtml = `<mat-card>
  <mat-card-content>
    <div class="view-grid">
      <div *ngFor="let field of fields" class="view-field">
        <label>{{field.label}}</label>
        <div class="value">
          <ng-container [ngSwitch]="field.type">
            <mat-chip *ngSwitchCase="'checkbox'" [color]="data[field.name] ? 'primary' : ''">
              {{data[field.name] ? 'Yes' : 'No'}}
            </mat-chip>
            <span *ngSwitchCase="'select'">{{getOptionName(field, data[field.name])}}</span>
            <span *ngSwitchCase="'autocomplete'">{{getOptionName(field, data[field.name])}}</span>
            <span *ngSwitchCase="'radio'">{{getOptionName(field, data[field.name])}}</span>
            <span *ngSwitchCase="'date'">{{data[field.name] | date}}</span>
            <span *ngSwitchDefault>{{data[field.name]}}</span>
          </ng-container>
        </div>
      </div>
    </div>
  </mat-card-content>
</mat-card>
`;

    const dynamicViewComponentScss = `mat-card {
  margin: 8px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

mat-card-content {
  padding: 16px;
}

.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.view-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-weight: 500;
    color: #666;
    font-size: 12px;
    text-transform: uppercase;
  }

  .value {
    font-size: 16px;
    word-break: break-word;
  }
}

@media (min-width: 1200px) {
  mat-card {
    margin: 16px auto;
  }

  mat-card-content {
    padding: 24px;
  }

  .view-grid {
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .view-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  mat-card-content {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  mat-card {
    margin: 4px;
  }

  mat-card-content {
    padding: 8px;
  }

  .view-grid {
    gap: 12px;
  }

  .view-field {
    label {
      font-size: 11px;
    }

    .value {
      font-size: 14px;
    }
  }
}
`;

    const dynamicDemoComponentHtml = `<div class="container">
  <h2>Dynamic Form Demo</h2>
  
  <div class="section">
    <app-dynamic-form 
      [fields]="fields" 
      [initialData]="formData"
      [isEditMode]="isEdit"
      [customClass]="'custom-form'"
      (formSubmit)="onSubmit($event)"
      (formCancel)="onCancel()">
    </app-dynamic-form>
  </div>

  <div class="section" *ngIf="viewData">
    <h3>View</h3>
    <app-dynamic-view [fields]="fields" [data]="viewData"></app-dynamic-view>
  </div>
</div>
`;

const dynamicDemoComponentScss = `.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: 40px;
}

h2, h3 {
  margin-bottom: 20px;
}

::ng-deep .custom-form {
  max-width: 800px;
  margin: 0 auto;
}

::ng-deep .gender-field mat-radio-group {
  flex-direction: row;
}
`;
const dynamicDemoComponentTs = `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { DynamicViewComponent } from '../dynamic-view/dynamic-view.component';
import { 
  FieldConfig,
  FieldType,
  TextFieldConfig, 
  NumberFieldConfig, 
  SelectFieldConfig, 
  AutocompleteFieldConfig, 
  TextareaFieldConfig, 
  DateFieldConfig, 
  RadioFieldConfig,
  RadioLayout,
  CheckboxFieldConfig, 
  FormArrayFieldConfig 
} from '../../models';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, startWith, map } from 'rxjs/operators';
import { CustomValidators } from '../../validators/custom-validators/custom-validators';
import { TitleCasePipe } from '../../pipes/title-case/title-case.pipe';
import { UpperCasePipe } from '../../pipes/upper-case/upper-case.pipe';
import { LowerCasePipe } from '../../pipes/lower-case/lower-case.pipe';

@Component({
  selector: 'app-dynamic-demo',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, DynamicViewComponent],
  templateUrl: './dynamic-demo.component.html',
  styleUrls: ['./dynamic-demo.component.scss']
})
export class DynamicDemoComponent implements OnInit {
  private readonly USA_COUNTRY_ID = 1;
  private readonly CITIES = [
    { id: 1, name: 'New York' },
    { id: 2, name: 'London' },
    { id: 3, name: 'Toronto' },
    { id: 4, name: 'Los Angeles' },
    { id: 5, name: 'Paris' },
    { id: 6, name: 'Tokyo' }
  ];

  cityOptions$!: Observable<{ id: any; name: string }[]>;
  fields!: FieldConfig[];
  formData = {};
  viewData: any = null;
  isEdit = false;

  private citySearchSubject = new Subject<string>();
  private titleCasePipe = new TitleCasePipe();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeCitySearch();
    this.initializeFormFields();
  }

  onSubmit(data: any): void {
    console.log('Form submitted:', data);
    this.viewData = data;
  }

  onCancel(): void {
    console.log('Form cancelled');
  }

  private initializeCitySearch(): void {
    this.cityOptions$ = this.citySearchSubject.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(searchTerm => this.searchCities(searchTerm))
    );
  }

  private searchCities(searchTerm: any): Observable<{ id: any; name: string }[]> {
    const term = typeof searchTerm === 'string' ? searchTerm : (searchTerm?.name || '');
    const filtered = this.CITIES.filter(city =>
      city.name.toLowerCase().includes(term.toLowerCase())
    );
    return new Observable(observer => {
      observer.next(filtered);
      observer.complete();
    });
  }

  private initializeFormFields(): void {
    this.fields = [
      this.createNameField(),
      this.createEmailField(),
      this.createBirthDateField(),
      this.createAgeField(),
      this.createCountryField(),
      this.createCityField(),
      this.createBioField(),
      this.createGenderField(),
      this.createSubscribeField(),
      this.createEmergencyContactsField()
    ];
  }

  private createNameField(): TextFieldConfig {
    return {
      name: 'name',
      label: 'Name',
      type: FieldType.Text,
      required: true,
      colSpan: 4,
      pipes: [TitleCasePipe],
      validators: [
        CustomValidators.minLength(2),
        CustomValidators.maxLength(150)
      ],
      errorMessages: {
        required: 'Please enter your name',
        minLength: 'Name must be at least 2 characters',
        maxLength: 'Name cannot exceed 150 characters',
      },
      hooks: {
        onChange: (value, formValue) => {
          console.log('Name changed:', value);
          console.log('Full form value:', formValue);
        }
      }
    };
  }

  private createEmailField(): TextFieldConfig {
    return {
      name: 'email',
      label: 'Email',
      type: FieldType.Email,
      required: true,
      colSpan: 4,
      pipes: [LowerCasePipe],
      errorMessages: {
        required: 'Email is mandatory',
        email: 'Please enter a valid email address'
      }
    };
  }

  private createAgeField(): NumberFieldConfig {
    return {
      name: 'age',
      label: 'Age',
      type: FieldType.Number,
      min: 0,
      max: 120,
      colSpan: 4,
      validators: [CustomValidators.ageRange(18, 65)],
      errorMessages: { ageRange: 'Age must be between 18 and 65' },
      hooks: {
        onChange: (value) => console.log('Age changed:', value),
        onBlur: (value) => console.log('Age blur:', value),
        onFocus: () => console.log('Age focused')
      }
    };
  }

  private createCountryField(): SelectFieldConfig {
    return {
      name: 'country',
      label: 'Country',
      type: FieldType.Select,
      required: true,
      colSpan: 4,
      options: [
        { id: 1, name: 'USA' },
        { id: 2, name: 'UK' },
        { id: 3, name: 'Canada' }
      ],
      errorMessages: { required: 'Please select a country' },
      hooks: {
        onChange: (value, formValue, form) => this.handleCountryChange(value, form)
      }
    };
  }

  private createCityField(): AutocompleteFieldConfig {
    return {
      name: 'city',
      label: 'City',
      type: FieldType.Autocomplete,
      colSpan: 4,
      required: true,
      filteredOptions: this.cityOptions$,
      displayWith: (option: any) => option?.name || '',
      errorMessages: { required: 'Please select a city' },
      hooks: {
        onChange: (value) => {
          this.citySearchSubject.next(value);
          console.log('City input changed:', value);
        }
      }
    };
  }

  private createBioField(): TextareaFieldConfig {
    return {
      name: 'bio',
      label: 'Bio',
      type: FieldType.Textarea,
      rows: 4,
      colSpan: 12,
      validators: [CustomValidators.minLength(10), CustomValidators.maxLength(500)],
      errorMessages: {
        minLength: 'Bio must be at least 10 characters',
        maxLength: 'Bio cannot exceed 500 characters'
      }
    };
  }

  private createBirthDateField(): DateFieldConfig {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, 0, 1);
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    
    return {
      name: 'birthDate',
      label: 'Birth Date',
      type: FieldType.Date,
      colSpan: 4,
      required: true,
      min: minDate,
      max: maxDate,
      dateFormat: 'dd MMM yyyy',
      validators: [
        (control: any) => {
          if (!control.value) return null;
          const date = new Date(control.value);
          if (date < minDate) return { minDate: true };
          if (date > maxDate) return { maxDate: true };
          return null;
        }
      ],
      errorMessages: {
        required: 'Birth date is required',
        minDate: 'Birth date cannot be more than 100 years ago',
        maxDate: 'You must be at least 18 years old'
      }
    };
  }

  private createGenderField(): RadioFieldConfig {
    return {
      name: 'gender',
      label: 'Gender',
      type: FieldType.Radio,
      colSpan: 8,
      required: true,
      newRow: true,
      layout: RadioLayout.Horizontal,
      errorMessages: { required: 'Please select a gender' },
      customClass: 'gender-field',
      options: [
        { id: 'male', name: 'Male' },
        { id: 'female', name: 'Female' },
        { id: 'other', name: 'Other' }
      ]
    };
  }

  private createSubscribeField(): CheckboxFieldConfig {
    return {
      name: 'subscribe',
      label: 'Subscribe to newsletter',
      type: FieldType.Checkbox,
      colSpan: 4,
      hooks: {
        onChange: (value) => this.handleSubscribeChange(value)
      }
    };
  }

  private createEmergencyContactsField(): FormArrayFieldConfig {
    return {
      name: 'contacts',
      label: 'Emergency Contacts',
      type: FieldType.FormArray,
      colSpan: 12,
      newRow: true,
      addButtonLabel: 'Add Contact',
      defaultEntry: true,
      buttonsPosition: 'inline',
      childFields: [
        {
          name: 'contactName',
          label: 'Contact Name',
          type: FieldType.Text,
          required: true,
          colSpan: 6,
          validators: [CustomValidators.minLength(2)],
          errorMessages: {
            required: 'Contact name is required',
            minLength: 'Name must be at least 2 characters'
          }
        } as TextFieldConfig,
        {
          name: 'contactPhone',
          label: 'Phone',
          type: FieldType.Text,
          required: true,
          colSpan: 6,
          validators: [CustomValidators.phoneNumber()],
          errorMessages: {
            required: 'Phone number is required',
            phoneNumber: 'Please enter a valid phone number'
          }
        } as TextFieldConfig
      ]
    };
  }

  private handleCountryChange(countryId: number, form: FormGroup): void {
    console.log('Country selected:', countryId);
    
    const isUSA = countryId === this.USA_COUNTRY_ID;
    this.toggleFieldsForUSA(form, isUSA);
    this.updateContactsAddButton(isUSA);

    if (isUSA) {
      this.addStateFieldIfNeeded(form);
      this.setDefaultCity(form);
    } else {
      this.removeStateFieldIfExists(form);
    }
  }

  private toggleFieldsForUSA(form: FormGroup, enable: boolean): void {
    const cityControl = form.get('city');
    const subscribeControl = form.get('subscribe');

    if (enable) {
      cityControl?.enable();
      subscribeControl?.enable();
    } else {
      cityControl?.disable();
      subscribeControl?.disable();
    }
  }

  private updateContactsAddButton(showButton: boolean): void {
    const contactsField = this.findContactsField();
    if (contactsField) {
      contactsField.showAddButton = showButton;
    }
  }

  private addStateFieldIfNeeded(form: FormGroup): void {
    const stateExists = this.fields.some(f => f.name === 'state');
    if (stateExists) return;

    const stateField = this.createStateField();
    const cityIndex = this.fields.findIndex(f => f.name === 'city');
    
    this.fields.splice(cityIndex + 1, 0, stateField);
    
    const stateControl = this.fb.control('', Validators.required);
    form.addControl('state', stateControl);
  }

  private removeStateFieldIfExists(form: FormGroup): void {
    const stateIndex = this.fields.findIndex(f => f.name === 'state');
    if (stateIndex !== -1) {
      this.fields.splice(stateIndex, 1);
    }

    if (form.get('state')) {
      form.removeControl('state');
    }
  }

  private setDefaultCity(form: FormGroup): void {
    form.patchValue({ city: { id: 1, name: 'New York' } });
  }

  private createStateField(): SelectFieldConfig {
    return {
      name: 'state',
      label: 'State',
      type: FieldType.Select,
      colSpan: 6,
      required: true,
      errorMessages: { required: 'Please select a state' },
      options: [
        { id: 1, name: 'California' },
        { id: 2, name: 'Texas' },
        { id: 3, name: 'New York' }
      ]
    };
  }

  private handleSubscribeChange(isSubscribed: boolean): void {
    const contactsField = this.findContactsField();
    if (contactsField) {
      contactsField.showRemoveButton = isSubscribed;
    }
  }

  private findContactsField(): FormArrayFieldConfig | undefined {
    return this.fields.find(f => f.name === 'contacts') as FormArrayFieldConfig;
  }
}
`;

    tree.create(`${libPath}/core/components/dynamic-form/dynamic-form.component.ts`, dynamicFormComponentTs);
    tree.create(`${libPath}/core/components/dynamic-form/dynamic-form.component.html`, dynamicFormComponentHtml);
    tree.create(`${libPath}/core/components/dynamic-form/dynamic-form.component.scss`, dynamicFormComponentScss);
    tree.create(`${libPath}/core/components/dynamic-view/dynamic-view.component.ts`, dynamicViewComponentTs);
    tree.create(`${libPath}/core/components/dynamic-view/dynamic-view.component.html`, dynamicViewComponentHtml);
    tree.create(`${libPath}/core/components/dynamic-view/dynamic-view.component.scss`, dynamicViewComponentScss);
    tree.create(`${libPath}/core/components/dynamic-demo/dynamic-demo.component.html`, dynamicDemoComponentHtml);
    tree.create(`${libPath}/core/components/dynamic-demo/dynamic-demo.component.scss`, dynamicDemoComponentScss);
    tree.create(`${libPath}/core/components/dynamic-demo/dynamic-demo.component.ts`, dynamicDemoComponentTs);
    tree.create(`${libPath}/core/components/index.ts`, `export * from './dynamic-form/dynamic-form.component';\nexport * from './dynamic-view/dynamic-view.component';\nexport * from './dynamic-demo/dynamic-demo.component';`);

    tree.create(`${libPath}/core/directives/highlight/highlight.directive.ts`, highlightDirective);
    tree.create(`${libPath}/core/directives/index.ts`, `export * from './highlight/highlight.directive';`);
    tree.create(`${libPath}/core/pipes/truncate/truncate.pipe.ts`, truncatePipe);
    tree.create(`${libPath}/core/pipes/capitalize/capitalize.pipe.ts`, capitalizePipe);
    tree.create(`${libPath}/core/pipes/amount-descriptor/amount-descriptor.pipe.ts`, amountDescriptorPipe);
    tree.create(`${libPath}/core/pipes/custom-date-format/custom-date-format.pipe.ts`, customDateFormatPipe);
    tree.create(`${libPath}/core/pipes/title-case/title-case.pipe.ts`, titleCasePipe);
    tree.create(`${libPath}/core/pipes/lower-case/lower-case.pipe.ts`, lowerCasePipe);
    tree.create(`${libPath}/core/pipes/upper-case/upper-case.pipe.ts`, upperCasePipe);
    tree.create(`${libPath}/core/pipes/index.ts`, `export * from './truncate/truncate.pipe';\nexport * from './capitalize/capitalize.pipe';\nexport * from './amount-descriptor/amount-descriptor.pipe';\nexport * from './custom-date-format/custom-date-format.pipe';\nexport * from './title-case/title-case.pipe';\nexport * from './lower-case/lower-case.pipe';\nexport * from './upper-case/upper-case.pipe';`);
    tree.create(`${libPath}/core/core.module.ts`, coreModule);
    tree.create(`${libPath}/core/index.ts`, `export * from './services';\nexport * from './validators';\nexport * from './directives';\nexport * from './pipes';\nexport * from './components';\nexport * from './models';\nexport * from './core.module';`);
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
    
    // Loader service
    const loaderService = `import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private requestCount = 0;
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }

  show(): void {
    if (!this.enabled) return;
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    if (!this.enabled) return;
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }
}`;

    // Loader interceptor
    const loaderInterceptor = `import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../loader-service/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  loaderService.show();
  return next(req).pipe(finalize(() => loaderService.hide()));
};`;

    // Loader component
    const loaderComponent = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from '../loader-service/loader.service';

@Component({
  selector: 'lib-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: \`
    <div class="loader-overlay" *ngIf="loaderService.loading$ | async">
      <mat-spinner diameter="50"></mat-spinner>
    </div>
  \`,
  styles: [\`
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
  \`]
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}
}`;

    // Create template library structure
    tree.create(`${libPath}/template/header/header.component.ts`, headerComponent);
    tree.create(`${libPath}/template/footer/footer.component.ts`, footerComponent);
    tree.create(`${libPath}/template/loader-service/loader.service.ts`, loaderService);
    tree.create(`${libPath}/template/loader-interceptor/loader.interceptor.ts`, loaderInterceptor);
    tree.create(`${libPath}/template/loader/loader.component.ts`, loaderComponent);
    tree.create(`${libPath}/template/index.ts`, `export * from './header/header.component';\nexport * from './footer/footer.component';\nexport * from './loader-service/loader.service';\nexport * from './loader-interceptor/loader.interceptor';\nexport * from './loader/loader.component';`);
    tree.create(`${libPath}/template/package.json`, JSON.stringify({ name: '@ngx-mfe/template', version: '1.0.0', main: 'index.ts' }, null, 2));

    // Main library public API
    const publicApi = `export * from './core';`;
    tree.create(`${libPath}/public-api.ts`, publicApi);
    tree.create(`${libPath}/core/package.json`, JSON.stringify({ name: '@ngx-mfe/core', version: '1.0.0', main: 'index.ts' }, null, 2));

    // Library package.json
    const libPackageJson = {
      name: '@ngx-mfe/core',
      version: '1.0.0',
      description: 'Shared library for MFE and Platform applications',
      main: 'dist/public-api.js',
      types: 'dist/public-api.d.ts',
      exports: {
        './core': {
          types: './dist/core/index.d.ts',
          default: './dist/core/index.js'
        },
        './data': {
          types: './dist/data/index.d.ts',
          default: './dist/data/index.js'
        },
        './template': {
          types: './dist/template/index.d.ts',
          default: './dist/template/index.js'
        }
      },
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
npm install @ngx-mfe/core@latest
\`\`\`

## Usage

\`\`\`typescript
import { ConfigService, BaseService } from '@ngx-mfe/core';
import { DataService, AuthService } from '@ngx-mfe/core';
import { HeaderComponent, FooterComponent } from '@ngx-mfe/core';
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
          npm pkg set name="@ngx-mfe/core"
      
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
