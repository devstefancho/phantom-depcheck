# Phantom Dependency Checker
Phantom Dependency Checker는 `package.json`에 누락된 패키지인 유령 의존성을 찾는 도구입니다.
소스 코드에서 `import` 또는 `require` 구문을 검색하고, `package.json`과 비교하여 누락된 의존성 목록을 출력합니다.

## Features
- 소스 코드를 파싱하여 `package.json`에 누락된 의존성을 찾습니다.
- `import` 및 `require` 구문을 정확하게 찾기 위해 AST (추상 구문 트리) 파싱을 사용합니다.
- 최종적으로 유령 의존성을 콘솔에 출력합니다.
## Installation
```bash
npm install phantom-depcheck # npm으로 설치
yarn add phantom-depcheck # yarn으로 설치

npx phantom-depcheck init # 설정파일을 생성
npx phantom-depcheck # 실행하기
```

## Configuration

npx phantom-depcheck init 명령어를 실행하면 다음과 같은 구조의 phantom-depcheck.config.js 파일이 생성됩니다:

```json
{
  "excludes": ["react", "react-dom"],
  "includePaths": ["src", "client"],
  "excludePaths": []
}
```

- excludes: 제외할 패키지 목록입니다. 여기에 추가된 패키지는 최종 결과에 출력되지 않습니다.
- includePaths: 사용하는 패키지들을 검색할 경로 리스트입니다. 비어있다면 모든 경로로 검색합니다.
- excludePaths: 제외하려는 경로입니다. 최상위 경로만 지원합니다. 예를들어, "src/pages"와 같은 중첩 경로는 지원하지 않습니다. 비어있더라도 `.git`과 `node_modules` 항상 제외됩니다.

## Notes:
tsconfig.json에 정의된 별칭 경로(alias paths)를 자동으로 제외하므로
별칭 경로는 excludes에 추가할 필요가 없습니다.
