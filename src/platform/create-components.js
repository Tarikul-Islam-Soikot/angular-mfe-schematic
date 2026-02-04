"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLibraryLogic = createLibraryLogic;
function createLibraryLogic(options) {
    return (tree) => {
        const libraryService = `import { Injectable } from '@angular/core';

export interface Library {
  id: number;
  name: string;
  description: string;
  version: string;
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private libraries: Library[] = [];
  private nextId = 1;

  getLibraries(): Library[] {
    return this.libraries;
  }

  createLibrary(library: Omit<Library, 'id'>): Library {
    const newLibrary = { ...library, id: this.nextId++ };
    this.libraries.push(newLibrary);
    return newLibrary;
  }

  updateLibrary(id: number, library: Partial<Library>): Library | null {
    const index = this.libraries.findIndex(lib => lib.id === id);
    if (index !== -1) {
      this.libraries[index] = { ...this.libraries[index], ...library };
      return this.libraries[index];
    }
    return null;
  }

  deleteLibrary(id: number): boolean {
    const index = this.libraries.findIndex(lib => lib.id === id);
    if (index !== -1) {
      this.libraries.splice(index, 1);
      return true;
    }
    return false;
  }
}`;
        const homeComponentTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {}`;
        const homeComponentHtml = `<mat-card>
  <mat-card-header>
    <mat-card-title>Welcome to Platform Shell</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <p>This is the platform application demonstrating lazy loading of:</p>
    <ul>
      <li><strong>Local Components:</strong> Home and Library components loaded lazily</li>
      <li><strong>Remote MFE Components:</strong> User management from micro-frontend</li>
    </ul>
    <div style="margin-top: 20px;">
      <button mat-raised-button color="primary" routerLink="/library" style="margin-right: 10px;">Local Library</button>
      <button mat-raised-button color="accent" routerLink="/users">Remote Users (MFE)</button>
    </div>
  </mat-card-content>
</mat-card>`;
        const homeComponentScss = `mat-card {
  margin: 16px;
}

button {
  margin-top: 16px;
}`;
        const libraryComponentTs = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { LibraryService, Library } from '../../services/library.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatListModule, MatIconModule],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent {
  libraries: Library[] = [];
  newLibrary = { name: '', description: '', version: '1.0.0' };

  constructor(private libraryService: LibraryService) {
    this.libraries = this.libraryService.getLibraries();
  }

  createLibrary() {
    if (this.newLibrary.name) {
      this.libraryService.createLibrary(this.newLibrary);
      this.newLibrary = { name: '', description: '', version: '1.0.0' };
      this.libraries = this.libraryService.getLibraries();
    }
  }

  deleteLibrary(id: number) {
    this.libraryService.deleteLibrary(id);
    this.libraries = this.libraryService.getLibraries();
  }
}`;
        const libraryComponentHtml = `<mat-card>
  <mat-card-header>
    <mat-card-title>Library Management</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <form (ngSubmit)="createLibrary()" #form="ngForm">
      <mat-form-field>
        <input matInput placeholder="Name" [(ngModel)]="newLibrary.name" name="name" required>
      </mat-form-field>
      <mat-form-field>
        <input matInput placeholder="Description" [(ngModel)]="newLibrary.description" name="description">
      </mat-form-field>
      <mat-form-field>
        <input matInput placeholder="Version" [(ngModel)]="newLibrary.version" name="version">
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">Create</button>
    </form>
    <mat-list>
      <mat-list-item *ngFor="let library of libraries">
        <h4 matListItemTitle>{{library.name}} v{{library.version}}</h4>
        <p matListItemLine>{{library.description}}</p>
        <button mat-icon-button (click)="deleteLibrary(library.id)">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-list-item>
    </mat-list>
  </mat-card-content>
</mat-card>`;
        const libraryComponentScss = `mat-form-field {
  width: 100%;
  margin-bottom: 16px;
}

mat-card {
  margin: 16px;
}`;
        tree.create(`${options.name}/src/app/services/library.service.ts`, libraryService);
        tree.create(`${options.name}/src/app/components/home/home.component.ts`, homeComponentTs);
        tree.create(`${options.name}/src/app/components/home/home.component.html`, homeComponentHtml);
        tree.create(`${options.name}/src/app/components/home/home.component.scss`, homeComponentScss);
        tree.create(`${options.name}/src/app/components/library/library.component.ts`, libraryComponentTs);
        tree.create(`${options.name}/src/app/components/library/library.component.html`, libraryComponentHtml);
        tree.create(`${options.name}/src/app/components/library/library.component.scss`, libraryComponentScss);
        const notFoundComponentTs = `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: \`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; padding: 20px;">
      <h1 style="font-size: 120px; margin: 0 0 40px 0; color: #f44336; font-weight: 300;">404</h1>
      <h2 style="color: #666; font-weight: 400; margin: 0 0 20px 0;">Page Not Found</h2>
      <p style="color: #999; margin: 0 0 30px 0; font-size: 16px;">The page you're looking for doesn't exist.</p>
      <button mat-raised-button color="primary" routerLink="/home">
        Go to Home
      </button>
    </div>
  \`
})
export class NotFoundComponent { }`;
        tree.create(`${options.name}/src/app/components/not-found/not-found.component.ts`, notFoundComponentTs);
        return tree;
    };
}
//# sourceMappingURL=create-components.js.map