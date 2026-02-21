"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTests = createTests;
function createTests(options) {
    return (tree) => {
        const userServiceTest = `import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should create user', () => {
    const result = service.createUser({ name: 'Test', email: 'test@test.com', roleId: 1, gender: 'Male', amount: 1000, isActive: true, countryId: 1 });
    expect(result.id).toBe(3);
    expect(service.getUsers()).toHaveLength(3);
  });

  it('should delete user', () => {
    expect(service.deleteUser(1)).toBe(true);
    expect(service.getUsers()).toHaveLength(1);
  });
});`;
        const userCrudComponentTest = `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { UserCrudComponent } from './user-crud.component';
import { UserService } from '../../services/user.service';

describe('UserCrudComponent', () => {
  let component: UserCrudComponent;
  let fixture: ComponentFixture<UserCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCrudComponent],
      providers: [UserService, provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});`;
        const appComponentTest = `import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});`;
        tree.create(`${options.name}/src/app/services/user.service.spec.ts`, userServiceTest);
        tree.create(`${options.name}/src/app/components/user-crud/user-crud.component.spec.ts`, userCrudComponentTest);
        tree.create(`${options.name}/src/app/app.component.spec.ts`, appComponentTest);
        return tree;
    };
}
//# sourceMappingURL=create-tests.js.map