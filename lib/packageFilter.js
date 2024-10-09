const fs = require("fs");
const path = require("path");
const { loadConfig } = require("./config");

function excludeTsconfigPaths(pkg) {
  const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
  let aliasPaths = [];

  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
    const paths = tsconfig.compilerOptions?.paths || {};
    aliasPaths = Object.keys(paths).map((alias) => alias.replace("/*", ""));
  }

  return !aliasPaths.some((alias) => pkg.startsWith(alias));
}

function excludeRelativeOrAbsolutePaths(pkg) {
  return ![".", "..", "/"].some((char) => pkg.startsWith(char));
}

function excludePackges(pkg) {
  const config = loadConfig();
  const excludes = config.excludes;
  return excludes.indexOf(pkg) === -1;
}

function packageFilters(importDeclarations) {
  return Array.from(importDeclarations)
    .filter(excludeRelativeOrAbsolutePaths)
    .filter(excludePackges)
    .filter(excludeTsconfigPaths);
}

function getPhantomDepsInOneFile(imports, allDepNames) {
  const phantomDependencies = new Set();
  imports.forEach((pkg) => {
    const notExist = allDepNames.indexOf(pkg) === -1;

    /**
     * @example
     * - pkg: react-dom/client
     * - dep: react-dom
     */
    const isNotSubmodule =
      allDepNames.findIndex((dep) => pkg.startsWith(dep)) === -1;

    if (notExist && isNotSubmodule) {
      phantomDependencies.add(pkg);
    }
  });

  return phantomDependencies;
}

module.exports = {
  packageFilters,
  getPhantomDepsInOneFile,
};
