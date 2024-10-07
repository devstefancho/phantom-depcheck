const fs = require("fs");
const path = require("path");
const { loadConfig } = require("./config");

const excludeTsconfigPaths = (pkg) => {
  const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
  let aliasPaths = [];

  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
    const paths = tsconfig.compilerOptions?.paths || {};
    aliasPaths = Object.keys(paths).map((alias) => alias.replace("/*", ""));
  }

  return !aliasPaths.some((alias) => pkg.startsWith(alias));
};

const excludeRelativeOrAbsolutePaths = (pkg) => {
  return ![".", "..", "/"].some((char) => pkg.startsWith(char));
};

const excludeCustomFilteredPackages = (pkg) => {
  const config = loadConfig();
  const customFilteredPackages = config.customFilteredPackages;
  return customFilteredPackages.indexOf(pkg) === -1;
};

const packageFilters = (importDeclarations) => {
  return Array.from(importDeclarations)
    .filter(excludeRelativeOrAbsolutePaths)
    .filter(excludeCustomFilteredPackages)
    .filter(excludeTsconfigPaths);
};

module.exports = {
  packageFilters,
};
