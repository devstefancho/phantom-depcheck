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
  const pkgName = pkg.split("/")[0];
  const config = loadConfig();
  const excludes = config.excludes;

  if (!excludes) {
    return true;
  }

  return excludes.indexOf(pkgName) === -1;
}

function getNpmRegisteredName(pkg) {
  const pkgFullPath = pkg.split("/");

  const isScopedPackage = pkgFullPath[0].startsWith("@");
  if (isScopedPackage) {
    return pkgFullPath.slice(0, 2).join("/");
  }

  return pkgFullPath[0];
}

function excludeDirectoriesInCurrentProject(pkg) {
  const currentDir = process.cwd();
  const directories = fs.readdirSync(currentDir).filter((file) => {
    return fs.statSync(path.join(currentDir, file)).isDirectory();
  });
  return !directories.includes(pkg);
}

function packageFilters(importDeclarations) {
  return Array.from(importDeclarations)
    .map(getNpmRegisteredName)
    .filter(excludeRelativeOrAbsolutePaths)
    .filter(excludeDirectoriesInCurrentProject)
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
