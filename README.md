# Angular MFE Schematic

Angular schematics for generating Micro Frontend (MFE) applications with Module Federation support.

## Features

- 🚀 Generate MFE applications with Angular 21
- 🔗 Module Federation pre-configured
- 🎨 Angular Material integrated
- 🧪 Jest testing setup
- 📦 Complete workspace structure

## Installation

### From GitHub

```bash
npm install -g github:Tarikul-Islam-Soikot/angular-mfe-schematic
```

Or install directly:

```bash
npm install -g https://github.com/Tarikul-Islam-Soikot/angular-mfe-schematic.git
```

> **Note:** You may see npm warnings about rxjs during installation on Windows. These are harmless and don't affect functionality.

### Verify Installation

```bash
# Check if schematic is installed
npm list -g angular-mfe-schematic

# View available schematics
ng new --help
```

## Usage

### Generate MFE Application

```bash
ng new my-workspace --collection=angular-mfe-schematic --schematic=mfe --name=my-mfe --port=4201
```

### Generate Platform Application

```bash
ng new my-workspace --collection=angular-mfe-schematic --schematic=platform --name=my-platform --port=4200
```

## Options

- `--name`: Application name (required)
- `--port`: Development server port (default: 4201 for MFE, 4200 for Platform)

## What's Included

### MFE Application
- User CRUD components with amount descriptor
- Amount validator (MAX_SAFE_INTEGER and 3 decimal places)
- Module Federation configuration
- Demo module for lazy loading
- Jest testing setup
- Angular Material components

### Platform Application
- Home and Library components
- Module Federation host configuration
- Remote MFE integration
- Shared library structure (@ngx-mfe/shared)
- GitHub Actions workflow for auto-publishing
- Jest testing setup

## Shared Library (@ngx-mfe/shared)

The platform schematic generates a shared library published to GitHub Packages:

### Installation

```bash
# Configure npm registry
echo "@ngx-mfe:registry=https://npm.pkg.github.com" > .npmrc

# Authenticate (requires GitHub account)
npm login --scope=@ngx-mfe --registry=https://npm.pkg.github.com

# Install library
npm install @ngx-mfe/shared
```

### What's Included

- **Services**: ConfigService, BaseService, NotificationService, DataService, AuthService
- **Validators**: Custom validators (email domain, strong password, no whitespace)
- **Directives**: HighlightDirective
- **Pipes**: TruncatePipe, CapitalizePipe, AmountDescriptorPipe
- **Components**: HeaderComponent, FooterComponent

### Usage

```typescript
import { ConfigService, BaseService } from '@ngx-mfe/shared';
import { AmountDescriptorPipe } from '@ngx-mfe/shared';
```

## Development

```bash
# Clone repository
git clone https://github.com/Tarikul-Islam-Soikot/angular-mfe-schematic.git
cd angular-mfe-schematic

# Install dependencies
npm install

# Build the schematic
npm run build

# Link for local testing
npm link

# Generate test projects
ng new test-mfe --collection=angular-mfe-schematic --schematic=mfe --name=test-mfe --port=4201
ng new test-platform --collection=angular-mfe-schematic --schematic=platform --name=test-platform --port=4200

# Run applications
cd test-mfe && npm start
cd test-platform && npm start
```

### Quick Start (Windows)

```bash
# Run everything in one command
build-schematic-link-generate-projects-run-locally.bat
```

## License

MIT
