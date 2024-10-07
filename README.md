# Phantom Dependency Checker
Phantom Dependency Checker helps identify phantom dependencies — packages used in your project but missing from package.json. It scans your source code for import or require statements, compares them with package.json, and outputs a list of missing dependencies.

## Features
- Detects missing dependencies in `package.json` based on actual usage in the source code.
- Uses AST (Abstract Syntax Tree) parsing to accurately find `import` and `require` statements.
- By default, scans the `src`, `pages` directories, but you can specify other directories.
- Outputs results to the console and logs them to a file.
## Installation
```bash
npm install phantom-depcheck # npm
yarn add phantom-depcheck # yarn

npx phantom-depcheck init # create config files
npx phantom-depcheck # running phantom-depcheck
```

## Configuration

Running `npx phantom-depcheck init` will generate a `phantom-depcheck.config.js` file with the following structure

```json
{
  "customFilteredPackages": ["react", "react-dom", "public"],
  "srcPaths": ["src", "client"]
}
```

- customFilteredPackages: A list of packages to exclude from the scan.
- srcPaths: An array of directories to search for import and require statements.

## Notes:
The checker automatically excludes alias paths defined in tsconfig.json,
so you don't need to add those to customFilteredPackages.
