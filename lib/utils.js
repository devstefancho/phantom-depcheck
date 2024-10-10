const fs = require("fs");
const path = require("path");

// 로그 파일에 기록하기
const logFilePath = path.join(process.cwd(), "result.log");

function logToFile(message) {
  fs.appendFileSync(logFilePath, `[${getCurrentLine()}] ${message}\n`, "utf8");
}

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

function getDirectoryNames() {
  const cwd = process.cwd();

  const defaultExcludePaths = [".git", "node_modules"];

  const dirs = fs
    .readdirSync(cwd)
    .filter((file) => !defaultExcludePaths.includes(file))
    .filter((file) => {
      return fs.statSync(path.join(cwd, file)).isDirectory();
    });

  return dirs;
}

module.exports = { logToFile, getCurrentLine, getDirectoryNames };
