# MFE Integration Guide

Complete guide for loading MFEs using Module Federation with helper utilities.

## Quick Setup

Run the batch script to test everything:
```bash
build-schematic-link-generate-projects-run-locally.bat
```

This script:
1. Builds the schematic
2. Links it locally
3. Generates test-platform and test-mfe
4. Installs dependencies
5. Starts both applications

## Helper Utilities

The platform includes `mfe-loader.util.ts` with two helper functions:

```typescript
// Load module-based routes or NgModules
loadMfeModule(mfeName: string, exposedModule: string)

// Load standalone components
loadMfeComponent(mfeName: string, exposedModule: string)
```

These helpers:
- Load MFE URLs from `appSettings.json`
- Handle errors for missing MFEs
- Simplify remote module loading

## Configuration

### Platform: appSettings.json
```json
{
  "mfeUrls": {
    "my-mfe": "http://localhost:4201",
    "product-mfe": "http://localhost:4202"
  }
}
```

### MFE: federation.config.ts
```javascript
module.exports = withNativeFederation({
  name: 'product-mfe',
  exposes: {
    './Routes': './src/app/app.routes.ts',
    './ProductModule': './src/app/modules/product/product.module.ts'
  }
});
```

## Loading Patterns

### 1. Load Routes Module (Recommended)

**MFE Side:**
```typescript
// src/app/app.routes.ts
export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: ':id', component: ProductDetailComponent }
];
```

**Expose in federation.config.ts:**
```javascript
exposes: {
  './Routes': './src/app/app.routes.ts'
}
```

**Platform Side:**
```typescript
// app.routes.ts
{
  path: 'products',
  loadChildren: () => loadMfeModule('product-mfe', './Routes').then(m => m.routes)
}
```

### 2. Load NgModule

**MFE Side:**
```typescript
// src/app/modules/product/product.module.ts
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: ProductComponent }
    ])
  ]
})
export class ProductModule { }
```

**Expose in federation.config.ts:**
```javascript
exposes: {
  './ProductModule': './src/app/modules/product/product.module.ts'
}
```

**Platform Side:**
```typescript
{
  path: 'products',
  loadChildren: () => loadMfeModule('product-mfe', './ProductModule').then(m => m.ProductModule)
}
```

### 3. Load Standalone Component

**MFE Side:**
```typescript
// src/app/components/product-detail.component.ts
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: '<h2>Product Details</h2>'
})
export class ProductDetailComponent { }
```

**Expose in federation.config.ts:**
```javascript
exposes: {
  './ProductDetailComponent': './src/app/components/product-detail.component.ts'
}
```

**Platform Side:**
```typescript
{
  path: 'product-detail',
  loadComponent: () => loadMfeComponent('product-mfe', './ProductDetailComponent')
}
```

## Adding New MFE

### Step 1: Generate MFE
```bash
ng new product-mfe --collection=angular-mfe-schematic --schematic=mfe --name=product-mfe --port=4202
cd product-mfe
npm install
```

### Step 2: Expose Components/Modules
Edit `federation.config.ts`:
```javascript
exposes: {
  './Routes': './src/app/app.routes.ts',
  './ProductModule': './src/app/modules/product/product.module.ts'
}
```

### Step 3: Register in Platform
Add to `appSettings.json`:
```json
{
  "mfeUrls": {
    "my-mfe": "http://localhost:4201",
    "product-mfe": "http://localhost:4202"
  }
}
```

### Step 4: Add Routes
Update platform `app.routes.ts`:
```typescript
{
  path: 'products',
  loadChildren: () => loadMfeModule('product-mfe', './Routes').then(m => m.routes)
}
```

### Step 5: Run Applications
```bash
# Terminal 1: Start MFE
cd product-mfe && npm start

# Terminal 2: Start Platform
cd platform && npm start
```

## Best Practices

1. **Use Routes Module** - Expose entire route configuration for flexibility
2. **Start MFEs First** - Platform needs remotes running
3. **Centralize URLs** - Use `appSettings.json` for all MFE URLs
4. **Error Handling** - Helper functions throw errors for missing MFEs
5. **Standalone Components** - Use for simple, isolated components
6. **NgModules** - Use for complex features with multiple components

## Troubleshooting

**Error: Unknown exposed module**
- Rebuild MFE after changing `federation.config.ts`
- Verify exposed module path is correct

**Error: Cannot load remote**
- Ensure MFE is running on correct port
- Check `appSettings.json` has correct URL
- Verify MFE name matches in both files

**Component not loading**
- Check component is properly exported
- Verify `loadMfeComponent` extracts component correctly
- Use browser DevTools to inspect network requests
