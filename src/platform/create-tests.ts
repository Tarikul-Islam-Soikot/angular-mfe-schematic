import { Rule, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function createTests(options: Schema): Rule {
  return (tree: Tree) => {
    const libraryServiceTest = `import { TestBed } from '@angular/core/testing';
import { LibraryService } from './library.service';

describe('LibraryService', () => {
  let service: LibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibraryService);
  });

  it('should create library', () => {
    const result = service.createLibrary({ name: 'Test', description: 'Test', version: '1.0.0' });
    expect(result.id).toBe(1);
    expect(service.getLibraries()).toHaveLength(1);
  });

  it('should delete library', () => {
    const lib = service.createLibrary({ name: 'Test', description: 'Test', version: '1.0.0' });
    expect(service.deleteLibrary(lib.id)).toBe(true);
    expect(service.getLibraries()).toHaveLength(0);
  });
});`;

    const homeComponentTest = `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});`;

    const libraryComponentTest = `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LibraryComponent } from './library.component';
import { LibraryService } from '../../services/library.service';

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryComponent],
      providers: [LibraryService, provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create library', () => {
    component.newLibrary = { name: 'Test', description: 'Test', version: '1.0.0' };
    component.createLibrary();
    expect(component.libraries).toHaveLength(1);
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

    tree.create(`${options.name}/src/app/services/library.service.spec.ts`, libraryServiceTest);
    tree.create(`${options.name}/src/app/components/home/home.component.spec.ts`, homeComponentTest);
    tree.create(`${options.name}/src/app/components/library/library.component.spec.ts`, libraryComponentTest);
    tree.create(`${options.name}/src/app/app.component.spec.ts`, appComponentTest);
    return tree;
  };
}