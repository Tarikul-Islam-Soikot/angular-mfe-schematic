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
- User CRUD components
- Module Federation configuration
- Demo module for lazy loading
- Jest testing setup
- Angular Material components

### Platform Application
- Home and Library components
- Module Federation host configuration
- Remote MFE integration
- Shared library structure
- Jest testing setup

## Development

```bash
# Build the schematic
npm run build

# Test locally
npm link
ng new test-app --collection=angular-mfe-schematic --schematic=mfe --name=test-mfe
```

## License

MIT
