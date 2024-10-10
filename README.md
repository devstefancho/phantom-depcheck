# Phantom Dependency Checker
Phantom Dependency Checker helps identify phantom dependencies — packages used in your project but missing from package.json. It scans your source code for import or require statements, compares them with package.json, and outputs a list of missing dependencies.

## Features
- Detects missing dependencies in `package.json` based on actual usage in the source code.
- Uses AST (Abstract Syntax Tree) parsing to accurately find `import` and `require` statements.
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
  "excludes": ["react", "react-dom"],
  "includePaths": ["src", "client"],
  "excludePaths": []
}
```

- excludes: A list of packages to exclude from the scan.
- includePaths: An array of directories to search for import and require statements.
- excludePaths: An array of directories not to search, `.git` and `node_modules` are excluded by default, Nested paths such as 'src/pages' are not supported, only top-level paths like 'src' are allowed.


## Notes:
The checker automatically excludes alias paths defined in tsconfig.json,
so you don't need to add those to excludes.
