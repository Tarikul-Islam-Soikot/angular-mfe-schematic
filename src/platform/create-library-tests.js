"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLibraryTests = createLibraryTests;
function createLibraryTests(options) {
    return (tree) => {
        const libName = 'shared-lib';
        const baseServiceTest = `import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BaseService } from './base.service';
import { NotificationService } from './notification.service';

describe('BaseService', () => {
  let service: BaseService;
  let httpMock: HttpTestingController;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotificationService', ['showError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BaseService,
        { provide: NotificationService, useValue: spy }
      ]
    });

    service = TestBed.inject(BaseService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should make GET request', () => {
    const mockData = { id: 1, name: 'test' };
    
    service.get('test').subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/test');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  afterEach(() => {
    httpMock.verify();
  });
});`;
        const validatorsTest = `import { FormControl } from '@angular/forms';
import { CustomValidators } from './custom-validators';

describe('CustomValidators', () => {
  describe('emailDomain', () => {
    it('should validate email domain', () => {
      const validator = CustomValidators.emailDomain('company.com');
      const control = new FormControl('test@company.com');
      expect(validator(control)).toBeNull();
      
      const invalidControl = new FormControl('test@other.com');
      expect(validator(invalidControl)).toEqual({
        emailDomain: { requiredDomain: 'company.com', actualValue: 'test@other.com' }
      });
    });
  });

  describe('strongPassword', () => {
    it('should validate strong password', () => {
      const validator = CustomValidators.strongPassword();
      const validControl = new FormControl('StrongPass123!');
      expect(validator(validControl)).toBeNull();
      
      const invalidControl = new FormControl('weak');
      expect(validator(invalidControl)).toEqual({ strongPassword: true });
    });
  });
});`;
        const notificationServiceTest = `import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: spy }
      ]
    });

    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should show success message', () => {
    service.showSuccess('Success message');
    expect(snackBar.open).toHaveBeenCalledWith('Success message', 'Close', jasmine.any(Object));
  });

  it('should show error message', () => {
    service.showError('Error message');
    expect(snackBar.open).toHaveBeenCalledWith('Error message', 'Close', jasmine.any(Object));
  });
});`;
        const truncatePipeTest = `import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should truncate long text', () => {
    const result = pipe.transform('This is a very long text that should be truncated', 10);
    expect(result).toBe('This is a ...');
  });

  it('should not truncate short text', () => {
    const result = pipe.transform('Short', 10);
    expect(result).toBe('Short');
  });
});`;
        const capitalizePipeTest = `import { CapitalizePipe } from './capitalize.pipe';

describe('CapitalizePipe', () => {
  let pipe: CapitalizePipe;

  beforeEach(() => {
    pipe = new CapitalizePipe();
  });

  it('should capitalize first letter', () => {
    const result = pipe.transform('hello world');
    expect(result).toBe('Hello world');
  });
});`;
        const configServiceTest = `import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService]
    });

    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load config from appSettings.json', () => {
    const mockConfig = {
      apiUrl: 'http://test-api.com',
      appName: 'Test App',
      version: '2.0.0',
      environment: 'test',
      features: { enableNotifications: true, enableLogging: false }
    };

    service.loadConfig().subscribe(config => {
      expect(config).toEqual(mockConfig);
      expect(service.apiUrl).toBe('http://test-api.com');
    });

    const req = httpMock.expectOne('/assets/appSettings.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);
  });

  afterEach(() => {
    httpMock.verify();
  });
});`;
        tree.create(`${options.name}/src/lib/${libName}/services/base-service/base.service.spec.ts`, baseServiceTest);
        tree.create(`${options.name}/src/lib/${libName}/services/config-service/config.service.spec.ts`, configServiceTest);
        tree.create(`${options.name}/src/lib/${libName}/services/notification-service/notification.service.spec.ts`, notificationServiceTest);
        tree.create(`${options.name}/src/lib/${libName}/validators/custom-validators/custom-validators.spec.ts`, validatorsTest);
        tree.create(`${options.name}/src/lib/${libName}/pipes/truncate-pipe/truncate.pipe.spec.ts`, truncatePipeTest);
        tree.create(`${options.name}/src/lib/${libName}/pipes/capitalize-pipe/capitalize.pipe.spec.ts`, capitalizePipeTest);
        return tree;
    };
}
//# sourceMappingURL=create-library-tests.js.map