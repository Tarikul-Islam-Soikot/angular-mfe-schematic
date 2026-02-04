import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function createUserComponents(options: Schema): Rule {
  return (tree: Tree) => {
    const userService = `import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
  ];
  private nextId = 3;

  getUsers(): User[] {
    return this.users;
  }

  createUser(user: Omit<User, 'id'>): User {
    const newUser = { ...user, id: this.nextId++ };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: number, user: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...user };
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
}`;

    const userListComponentTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  users: User[] = [];
  displayedColumns = ['name', 'email', 'role', 'actions'];

  constructor(private userService: UserService) {
    this.users = this.userService.getUsers();
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id);
      this.users = [...this.userService.getUsers()];
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
    <mat-table [dataSource]="users" class="mat-elevation-z2">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let user">{{user.name}}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="email">
        <mat-header-cell *matHeaderCellDef>Email</mat-header-cell>
        <mat-cell *matCellDef="let user">{{user.email}}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="role">
        <mat-header-cell *matHeaderCellDef>Role</mat-header-cell>
        <mat-cell *matCellDef="let user">{{user.role}}</mat-cell>
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
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-create-or-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './create-or-edit-user.component.html',
  styleUrls: ['./create-or-edit-user.component.scss']
})
export class CreateOrEditUserComponent implements OnInit {
  user = { name: '', email: '', role: '' };
  isEditMode = false;
  userId: number | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = Number(id);
      this.isEditMode = true;
      const existingUser = this.userService.getUsers().find(u => u.id === this.userId);
      if (existingUser) {
        this.user = { name: existingUser.name, email: existingUser.email, role: existingUser.role };
      }
    }
  }

  onSubmit() {
    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, this.user);
    } else {
      this.userService.createUser(this.user);
    }
    this.router.navigate(['/users']);
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
      <form (ngSubmit)="onSubmit()" #form="ngForm" class="user-form">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="user.name" name="name" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="user.email" name="email" type="email" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <input matInput [(ngModel)]="user.role" name="role" required>
        </mat-form-field>
        
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">
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

    tree.create(`${options.name}/src/app/services/user.service.ts`, userService);
    tree.create(`${options.name}/src/app/components/user-crud/user-crud.component.ts`, userCrudComponentTs);
    tree.create(`${options.name}/src/app/components/create-or-edit-user/create-or-edit-user.component.ts`, createOrEditUserComponentTs);
    tree.create(`${options.name}/src/app/components/create-or-edit-user/create-or-edit-user.component.html`, createOrEditUserComponentHtml);
    tree.create(`${options.name}/src/app/components/create-or-edit-user/create-or-edit-user.component.scss`, createOrEditUserComponentScss);
    tree.create(`${options.name}/src/app/components/user-list/user-list.component.ts`, userListComponentTs);
    tree.create(`${options.name}/src/app/components/user-list/user-list.component.html`, userListComponentHtml);
    tree.create(`${options.name}/src/app/components/user-list/user-list.component.scss`, userListComponentScss);
    
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