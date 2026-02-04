import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function createTests(options: Schema): Rule {
  return (tree: Tree) => {
    const userServiceTest = `import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should create user', () => {
    const result = service.createUser({ name: 'Test', email: 'test@test.com', role: 'User' });
    expect(result.id).toBe(3);
    expect(service.getUsers()).toHaveLength(3);
  });

  it('should delete user', () => {
    expect(service.deleteUser(1)).toBe(true);
    expect(service.getUsers()).toHaveLength(1);
  });
});`;

    const userCrudComponentTest = `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { UserCrudComponent } from './user-crud.component';
import { UserService } from './user.service';

describe('UserCrudComponent', () => {
  let component: UserCrudComponent;
  let fixture: ComponentFixture<UserCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserCrudComponent],
      imports: [
        FormsModule, NoopAnimationsModule, MatCardModule,
        MatFormFieldModule, MatInputModule, MatButtonModule,
        MatTableModule, MatIconModule
      ],
      providers: [UserService]
    }).compileComponents();

    fixture = TestBed.createComponent(UserCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save new user', () => {
    component.currentUser = { name: 'New User', email: 'new@test.com', role: 'User' };
    component.saveUser();
    expect(component.users).toHaveLength(3);
  });
});`;

    const appComponentTest = `import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatToolbarModule, MatButtonModule],
      declarations: [AppComponent]
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