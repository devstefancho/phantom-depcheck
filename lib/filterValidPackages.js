const fs = require("fs");
const path = require("path");
const { loadConfig } = require("./config");

function excludeTsconfigAliasPaths(pkg) {
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

function excludeByConfig(pkg) {
  const [pkgName, pkgSubPathName] = pkg.split("/");
  const config = loadConfig();
  const excludes = config.excludes;

  if (!excludes) {
    return true;
  }

  if (pkgName.startsWith("@")) {
    return excludes.indexOf(`${pkgName}/${pkgSubPathName}`) === -1;
  }

  return excludes.indexOf(pkgName) === -1;
}

function extractNpmPackageName(pkg) {
  const pkgFullPath = pkg.split("/");

  const isScopedPackage = pkgFullPath[0].startsWith("@");
  if (isScopedPackage) {
    return pkgFullPath.slice(0, 2).join("/");
  }

  return pkgFullPath[0];
}

function excludeProjectDirectories(pkg) {
  const currentDir = process.cwd();
  const directories = fs.readdirSync(currentDir).filter((file) => {
    return fs.statSync(path.join(currentDir, file)).isDirectory();
  });
  return !directories.includes(pkg);
}

function filterValidPackages(importDeclarations) {
  return Array.from(importDeclarations)
    .map(extractNpmPackageName)
    .filter(excludeRelativeOrAbsolutePaths)
    .filter(excludeProjectDirectories)
    .filter(excludeByConfig)
    .filter(excludeTsconfigAliasPaths);
}

function findPhantomDepsInFile(imports, allDepNames) {
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
  filterValidPackages,
  findPhantomDepsInFile,
};
