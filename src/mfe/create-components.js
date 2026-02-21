"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserComponents = createUserComponents;
function createUserComponents(options) {
    return (tree) => {
        const userService = `import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  gender: string;
  amount: number;
  isActive: boolean;
  countryId: number;
  countryName: string;
}

export interface UserDto {
  name: string;
  email: string;
  roleId: number;
  gender: string;
  amount: number;
  isActive: boolean;
  countryId: number;
}

export interface Role {
  id: number;
  name: string;
}

export interface Country {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', roleId: 1, roleName: 'Admin', gender: 'male', amount: 5000, isActive: true, countryId: 1, countryName: 'USA' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', roleId: 2, roleName: 'User', gender: 'female', amount: 15000, isActive: true, countryId: 2, countryName: 'UK' }
  ];
  private nextId = 3;
  
  private roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Guest' }
  ];
  
  private countries: Country[] = [
    { id: 1, name: 'USA' },
    { id: 2, name: 'UK' },
    { id: 3, name: 'Canada' },
    { id: 4, name: 'Australia' },
    { id: 5, name: 'Germany' },
    { id: 6, name: 'France' },
    { id: 7, name: 'India' },
    { id: 8, name: 'Japan' }
  ];

  getUsers(): User[] {
    return this.users.map(user => ({
      ...user,
      roleName: this.roles.find(r => r.id === user.roleId)?.name || '',
      countryName: this.countries.find(c => c.id === user.countryId)?.name || ''
    }));
  }

  createUser(user: UserDto): User {
    const role = this.roles.find(r => r.id === user.roleId);
    const country = this.countries.find(c => c.id === user.countryId);
    const newUser: User = { 
      ...user, 
      id: this.nextId++,
      roleName: role?.name || '',
      countryName: country?.name || ''
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: number, user: Partial<UserDto>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      const role = user.roleId ? this.roles.find(r => r.id === user.roleId) : undefined;
      const country = user.countryId ? this.countries.find(c => c.id === user.countryId) : undefined;
      this.users[index] = { 
        ...this.users[index], 
        ...user,
        ...(role && { roleName: role.name }),
        ...(country && { countryName: country.name })
      };
      return this.users[index];
    }
    return null;
  }

  deleteUser(id: number): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
  
  getCountries(): Country[] {
    return this.countries;
  }
  
  getRoles(): Role[] {
    return this.roles;
  }
}`;
        const userListComponentTs = `import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { UserService, User } from '../../services/user.service';
import { AmountDescriptorPipe } from '../../pipes/amount-descriptor.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule, MatChipsModule, MatPaginatorModule, MatSortModule, AmountDescriptorPipe],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements AfterViewInit {
  dataSource = new MatTableDataSource<User>();
  displayedColumns = ['name', 'email', 'role', 'gender', 'amount', 'isActive', 'country', 'actions'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService) {
    this.dataSource.data = this.userService.getUsers();
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id);
      this.dataSource.data = this.userService.getUsers();
    }
  }
}`;
        const userListComponentHtml = `<div class="user-management-container">
  <div class="title-section">
    <h2>User Management</h2>
  </div>
  
  <div class="action-section">
    <button mat-raised-button color="primary" routerLink="add">
      <mat-icon>add</mat-icon>
      Add New User
    </button>
  </div>
  
  <mat-card class="table-card">
    <mat-table [dataSource]="dataSource" matSort class="mat-elevation-z2">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Name</mat-header-cell>
        <mat-cell *matCellDef="let user">{{user.name}}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="email">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Email</mat-header-cell>
        <mat-cell *matCellDef="let user">{{user.email}}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="role">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Role</mat-header-cell>
        <mat-cell *matCellDef="let user">{{user.roleName}}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="gender">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Gender</mat-header-cell>
        <mat-cell *matCellDef="let user">{{user.gender}}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="amount">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Amount</mat-header-cell>
        <mat-cell *matCellDef="let user">
          <span [matTooltip]="user.amount | amountDescriptor">\${{user.amount | number}}</span>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="isActive">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Status</mat-header-cell>
        <mat-cell *matCellDef="let user">
          <mat-chip [color]="user.isActive ? 'primary' : 'warn'">{{user.isActive ? 'Active' : 'Inactive'}}</mat-chip>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="country">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Country</mat-header-cell>
        <mat-cell *matCellDef="let user">{{user.countryName}}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
        <mat-cell *matCellDef="let user">
          <button mat-icon-button color="primary" [routerLink]="['edit', user.id]" matTooltip="Edit User">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="deleteUser(user.id)" matTooltip="Delete User">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
    <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
  </mat-card>
</div>`;
        const userListComponentScss = `.user-management-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.title-section {
  text-align: center;
  margin-bottom: 16px;
}

.title-section h2 {
  margin: 0;
  color: #333;
  font-weight: 500;
}

.action-section {
  margin-bottom: 24px;
}

.table-card {
  padding: 0;
}

.mat-table {
  width: 100%;
}

.mat-header-cell {
  font-weight: 600;
  color: #333;
}

.mat-cell {
  padding: 12px 8px;
}

.mat-header-cell:first-of-type,
.mat-cell:first-of-type {
  padding-left: 24px;
}

.mat-header-cell:last-of-type,
.mat-cell:last-of-type {
  padding-right: 24px;
}

@media (max-width: 768px) {
  .user-management-container {
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-section button {
    width: 100%;
  }
}`;
        const createOrEditUserComponentTs = `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UserService, Role, Country } from '../../services/user.service';
import { AmountDescriptorPipe } from '../../pipes/amount-descriptor.pipe';
import { amountValidator } from '../../validators/amount.validator';

@Component({
  selector: 'app-create-or-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatRadioModule, MatCheckboxModule, MatSelectModule, MatAutocompleteModule, AmountDescriptorPipe],
  templateUrl: './create-or-edit-user.component.html',
  styleUrls: ['./create-or-edit-user.component.scss']
})
export class CreateOrEditUserComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  roles: Role[] = [];
  countries: Country[] = [];
  filteredCountries!: Observable<Country[]>;
  maxAmount = Number.MAX_SAFE_INTEGER;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.roles = this.userService.getRoles();
    this.countries = this.userService.getCountries();
    
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      roleId: ['', Validators.required],
      gender: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0), amountValidator]],
      isActive: [true],
      countryId: ['', Validators.required]
    });
    
    this.userForm.get('amount')?.valueChanges.subscribe(() => {
      this.userForm.get('amount')?.markAsTouched();
    });
    
    this.filteredCountries = this.userForm.get('countryId')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? this._filterCountries(value) : this.countries)
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = Number(id);
      this.isEditMode = true;
      const existingUser = this.userService.getUsers().find(u => u.id === this.userId);
      if (existingUser) {
        this.userForm.patchValue(existingUser);
      }
    }
  }
  
  private _filterCountries(value: string): Country[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(country => country.name.toLowerCase().includes(filterValue));
  }
  
  displayCountry(country: Country): string {
    return country?.name || '';
  }

  onSubmit() {
    if (this.userForm.valid) {
      if (this.isEditMode && this.userId) {
        this.userService.updateUser(this.userId, this.userForm.value);
      } else {
        this.userService.createUser(this.userForm.value);
      }
      this.router.navigate(['/users']);
    }
  }

  onCancel() {
    this.router.navigate(['/users']);
  }
}`;
        const createOrEditUserComponentHtml = `<div class="form-container">
  <div class="title-section">
    <h2>{{isEditMode ? 'Edit User' : 'Create New User'}}</h2>
  </div>
  
  <mat-card class="form-card">
    <mat-card-content>
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="userForm.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required>
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">Invalid email</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select formControlName="roleId" required>
            <mat-option *ngFor="let role of roles" [value]="role.id">{{role.name}}</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-label>Gender</mat-label>
        <mat-radio-group formControlName="gender" class="radio-group">
          <mat-radio-button value="male">Male</mat-radio-button>
          <mat-radio-button value="female">Female</mat-radio-button>
          <mat-radio-button value="other">Other</mat-radio-button>
        </mat-radio-group>
        
        <mat-form-field appearance="outline">
          <mat-label>Amount</mat-label>
          <input matInput formControlName="amount" type="number" required step="0.001">
          <mat-hint *ngIf="!userForm.get('amount')?.invalid">{{userForm.get('amount')?.value | amountDescriptor}}</mat-hint>
          <mat-error *ngIf="userForm.get('amount')?.hasError('min')">Min: {{userForm.get('amount')?.errors?.['min']?.min}} (Current: {{userForm.get('amount')?.value}})</mat-error>
          <mat-error *ngIf="userForm.get('amount')?.hasError('maxAmount')">Max: {{maxAmount | number}}</mat-error>
          <mat-error *ngIf="userForm.get('amount')?.hasError('maxDecimals')">Max 3 decimal places</mat-error>
        </mat-form-field>
        
        <mat-checkbox formControlName="isActive">Active</mat-checkbox>
        
        <mat-form-field appearance="outline">
          <mat-label>Country</mat-label>
          <input matInput formControlName="countryId" [matAutocomplete]="auto" required>
          <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayCountry">
            <mat-option *ngFor="let country of filteredCountries | async" [value]="country.id">
              {{country.name}}
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>
        
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="!userForm.valid">
            <mat-icon>{{isEditMode ? 'save' : 'add'}}</mat-icon>
            {{isEditMode ? 'Update' : 'Create'}} User
          </button>
          <button mat-button type="button" (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            Cancel
          </button>
        </div>
      </form>
    </mat-card-content>
  </mat-card>
</div>`;
        const createOrEditUserComponentScss = `.form-container {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.title-section {
  text-align: center;
  margin-bottom: 24px;
}

.title-section h2 {
  margin: 0;
  color: #333;
  font-weight: 500;
}

.form-card {
  padding: 0;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.user-form mat-form-field {
  width: 100%;
}

.radio-group {
  display: flex;
  gap: 16px;
  margin: 16px 0;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .form-container {
    padding: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}`;
        const amountDescriptorPipe = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amountDescriptor',
  standalone: true
})
export class AmountDescriptorPipe implements PipeTransform {
  transform(value: number): string {
    if (!value || value === 0) return 'Zero';
    if (value < 0) return 'Negative ' + this.transform(Math.abs(value));
    if (value > Number.MAX_SAFE_INTEGER) return '';
    
    const parts: string[] = [];
    let remaining = Math.floor(value);
    const decimalPart = value - remaining;
    const decimalStr = decimalPart > 0 ? decimalPart.toFixed(3).substring(2).replace(/0+$/, '') : '';
    const decimal = decimalStr ? parseInt(decimalStr) : 0;
    
    const trillion = Math.floor(remaining / 1_000_000_000_000);
    if (trillion > 0) {
      parts.push(\`\${trillion} trillion\`);
      remaining %= 1_000_000_000_000;
    }
    
    const billion = Math.floor(remaining / 1_000_000_000);
    if (billion > 0) {
      parts.push(\`\${billion} billion\`);
      remaining %= 1_000_000_000;
    }
    
    const million = Math.floor(remaining / 1_000_000);
    if (million > 0) {
      parts.push(\`\${million} million\`);
      remaining %= 1_000_000;
    }
    
    const thousand = Math.floor(remaining / 1_000);
    if (thousand > 0) {
      parts.push(\`\${thousand} thousand\`);
      remaining %= 1_000;
    }
    
    const hundred = Math.floor(remaining / 100);
    if (hundred > 0) {
      parts.push(\`\${hundred} hundred\`);
      remaining %= 100;
    }
    
    if (remaining > 0) {
      parts.push(remaining.toString());
    }
    
    if (decimal > 0) {
      parts.push(\`point \${decimal}\`);
    }
    
    return parts.length > 0 ? parts.join(' ') : 'Zero';
  }
}`;
        const userCrudComponentTs = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-crud',
  standalone: true,
  imports: [RouterOutlet],
  template: \`<router-outlet></router-outlet>\`,
  styles: []
})
export class UserCrudComponent { }`;
        const amountValidator = `import { AbstractControl, ValidationErrors } from '@angular/forms';

export function amountValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  if (value > Number.MAX_SAFE_INTEGER) return { maxAmount: true };
  if (value.toString().includes('.')) {
    const decimals = value.toString().split('.')[1];
    if (decimals && decimals.length > 3) return { maxDecimals: true };
  }
  return null;
}`;
        tree.create(`${options.name}/src/app/validators/amount.validator.ts`, amountValidator);
        tree.create(`${options.name}/src/app/pipes/amount-descriptor.pipe.ts`, amountDescriptorPipe);
        tree.create(`${options.name}/src/app/services/user.service.ts`, userService);
        tree.create(`${options.name}/src/app/components/create-or-edit-user/create-or-edit-user.component.ts`, createOrEditUserComponentTs);
        tree.create(`${options.name}/src/app/components/create-or-edit-user/create-or-edit-user.component.html`, createOrEditUserComponentHtml);
        tree.create(`${options.name}/src/app/components/create-or-edit-user/create-or-edit-user.component.scss`, createOrEditUserComponentScss);
        tree.create(`${options.name}/src/app/components/user-list/user-list.component.ts`, userListComponentTs);
        tree.create(`${options.name}/src/app/components/user-list/user-list.component.html`, userListComponentHtml);
        tree.create(`${options.name}/src/app/components/user-list/user-list.component.scss`, userListComponentScss);
        tree.create(`${options.name}/src/app/components/user-crud/user-crud.component.ts`, userCrudComponentTs);
        const demoComponentTs = `import { Component } from '@angular/core';

@Component({
  selector: 'app-demo',
  template: \`
    <div style="padding: 20px;">
      <h2>Demo Module (Lazy Loaded)</h2>
      <p>This is a module-based component loaded via Module Federation!</p>
    </div>
  \`
})
export class DemoComponent { }`;
        const demoModuleTs = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DemoComponent } from './demo.component';

const routes: Routes = [
  { path: '', component: DemoComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes), 
    DemoComponent
  ]
})
export class DemoModule { }`;
        tree.create(`${options.name}/src/app/modules/demo/demo.component.ts`, demoComponentTs);
        tree.create(`${options.name}/src/app/modules/demo/demo.module.ts`, demoModuleTs);
        return tree;
    };
}
//# sourceMappingURL=create-components.js.map