#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

// package.json 파일 경로 설정
const packageJsonPath = path.join(process.cwd(), "package.json");
const srcPath = path.join(process.cwd(), "src");

// package.json 파일 읽기
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};

// 현재 호출된 라인의 정보를 얻는 함수
function getCurrentLine() {
  const error = new Error();
  const stack = error.stack.split("\n")[2].trim();
  const lineInfo = stack.match(/\((.*):(\d+):\d+\)/); // 파일명, 라인 번호 매칭
  if (lineInfo) {
    return `${lineInfo[1]}: Line ${lineInfo[2]}`;
  }
  return "Unknown line";
}

// 로그 파일에 기록하기
const logFilePath = path.join(process.cwd(), "result.log");
function logToFile(message) {
  fs.appendFileSync(logFilePath, `[${getCurrentLine()}] ${message}\n`, "utf8");
}

// 파일에서 import된 패키지를 추출하는 함수 (AST 사용)
function findImportsInFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");

  // AST로 파일 파싱
  const ast = parser.parse(fileContent, {
    sourceType: "module", // ES 모듈
    plugins: ["jsx", "typescript"], // JSX와 TS도 지원
  });

  // if (filePath.includes("Poster.tsx")) {
  //   logToFile(`Parsing ${filePath} ${JSON.stringify(ast)}`);
  // }

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

  // node_modules 패키지만 필터링 (상대 경로, Path Alias, submodules 제외)
  return Array.from(imports)
    .map((importPath) => importPath.split("/")[0])
    .filter(
      (pkg) => ![".", "..", "/", "@"].some((char) => pkg.startsWith(char)),
    );
}

// 유령 의존성 탐지 함수
function findPhantomDependencies() {
  const phantomDependencies = new Set();

  // src 디렉토리의 모든 .js, .ts, .jsx, .tsx 파일 찾기
  const files = glob.sync(path.join(srcPath, "**/*.{js,ts,jsx,tsx}"));
  logToFile(`Found ${files.length} files in ${srcPath}`);

  // 각 파일에서 import된 모듈을 찾고, package.json과 비교
  files.forEach((file) => {
    const imports = findImportsInFile(file);
    imports.forEach((pkg) => {
      if (!(dependencies[pkg] || devDependencies[pkg])) {
        phantomDependencies.add(pkg);
      }
    });
  });

  return Array.from(phantomDependencies);
}

// 유령 의존성 찾기 실행
const phantomDeps = findPhantomDependencies();
if (phantomDeps.length > 0) {
  console.log("Phantom dependencies found:");
  phantomDeps.forEach((dep) => console.log(`- ${dep}`));
} else {
  console.log("No phantom dependencies found.");
}
