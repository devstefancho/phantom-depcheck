const fs = require("fs");
const path = require("path");

const configFilePath = path.join(process.cwd(), "phantom-depcheck.config.json");

const defaultConfig = {
  /**
   * @property {string[]} excludes - 탐색에서 제외할 패키지 목록
   */
  excludes: ["react", "react-dom", "public"],

  /**
   * @property {string[]} srcPaths - 탐색할 소스코드 디렉토리 목록
   */
  srcPaths: ["src", "pages"],
};

// 설정 파일 로드 함수
function loadConfig() {
  if (fs.existsSync(configFilePath)) {
    return JSON.parse(fs.readFileSync(configFilePath, "utf8"));
  } else {
    return defaultConfig;
  }
}

// 설정 파일 생성 함수 (init 명령어로 실행)
function initConfigFile() {
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(
      configFilePath,
      JSON.stringify(defaultConfig, null, 2),
      "utf8",
    );
    console.log("phantom-depcheck.config.json has been created.");
  } else {
    console.log("phantom-depcheck.config.json already exists.");
  }
}

module.exports = { loadConfig, initConfigFile };
