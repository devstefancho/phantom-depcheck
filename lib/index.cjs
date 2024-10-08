#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { loadConfig, initConfigFile } = require("./config");
const { logToFile, getDirectoryNames } = require("./utils");
const {
  filterValidPackages,
  findPhantomDepsInFile,
} = require("./filterValidPackages");

// 파일에서 import된 패키지를 추출하는 함수 (AST 사용)
function findImportsInFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");

  // AST로 파일 파싱
  const ast = parser.parse(fileContent, {
    sourceType: "module", // ES 모듈
    plugins: [
      "jsx",
      "typescript",
      ["decorators", { decoratorsBeforeExport: true }], // 최신 데코레이터 문법 사용
    ],
  });

  const imports = new Set();

  // AST를 순회하면서 import 구문과 require 구문을 찾아냅니다.
  traverse(ast, {
    ImportDeclaration({ node }) {
      imports.add(node.source.value);
    },
    CallExpression({ node }) {
      if (node.callee.name === "require" && node.arguments.length > 0) {
        const arg = node.arguments[0];
        if (arg.type === "StringLiteral") {
          imports.add(arg.value);
        }
      }
    },
  });

  return filterValidPackages(imports);
}

// 유령 의존성 탐지 함수
function findPhantomDependencies() {
  const phantomDependencies = new Set();
  const config = loadConfig();

  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  const allDeps = { ...dependencies, ...devDependencies };

  // 설정 파일에 정의된 여러 includePaths를 처리
  const includePaths =
    config.includePaths.length > 0 ? config.includePaths : getDirectoryNames();

  const excludePaths = config.excludePaths || [];

  includePaths
    .filter((srcPath) => !excludePaths.includes(srcPath))
    .forEach((srcPath) => {
      const cwd = process.cwd();
      const resolvedSrcPath = path.join(cwd, srcPath);
      const files = glob.sync(
        path.join(resolvedSrcPath, "**/*.{js,ts,jsx,tsx}"),
      );

      logToFile(`Found ${files.length} files in ${resolvedSrcPath}`);

      files.forEach((file) => {
        const _imports = findImportsInFile(file);
        const _allDepNames = Object.keys(allDeps);
        const deps = findPhantomDepsInFile(
          _imports,
          _allDepNames,
          phantomDependencies,
        );
        deps.forEach((dep) => phantomDependencies.add(dep));
      });
    });

  return Array.from(phantomDependencies);
}

// 프로그램 실행 부분
const args = process.argv.slice(2);
if (args[0] === "init") {
  initConfigFile();
} else {
  const phantomDeps = findPhantomDependencies();
  if (phantomDeps.length > 0) {
    console.log("Phantom dependencies found:");
    phantomDeps.forEach((dep) => console.log(`- ${dep}`));
  } else {
    console.log("No phantom dependencies found.");
  }
}
