# Phantom Dependency Checker
Phantom Dependency Checker helps identify phantom dependencies — packages used in your project but missing from package.json. It scans your source code for import or require statements, compares them with package.json, and outputs a list of missing dependencies.

## Features
Detects missing dependencies in package.json based on source code.
Uses AST parsing to accurately find import and require statements.
Default scans the src folder, but you can specify any directory.
Outputs results to the console and logs them to a file.
## Installation
```bash
npm install -g phantom-depcheck # npm
yarn global add phantom-depcheck # yarn
npx phantom-depcheck # phantom-depcheck in your project directory. By default, it scans the src folder.
npx phantom-depcheck <directory> # To specify a different folder (ex. npx phantom-depcheck client)
```
