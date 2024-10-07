#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { loadConfig, initConfigFile } = require("./config");
const { logToFile } = require("./utils");
const { packageFilters } = require("./packageFilter");

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

  return packageFilters(imports);
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

  // 설정 파일에 정의된 여러 srcPaths를 처리
  config.srcPaths.forEach((srcPath) => {
    const resolvedSrcPath = path.join(process.cwd(), srcPath);
    const files = glob.sync(path.join(resolvedSrcPath, "**/*.{js,ts,jsx,tsx}"));
    logToFile(`Found ${files.length} files in ${resolvedSrcPath}`);

    files.forEach((file) => {
      const imports = findImportsInFile(file);
      imports.forEach((pkg) => {
        const notExist = !allDeps[pkg];

        /**
         * @example
         * - pkg: react-dom/client
         * - dep: react-dom
         */
        const isNotSubmodule =
          Object.keys(allDeps).findIndex((dep) => pkg.startsWith(dep)) === -1;

        if (notExist && isNotSubmodule) {
          phantomDependencies.add(pkg);
        }
      });
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
