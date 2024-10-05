# Search Phantom Dependency

yarn 사용시에 monorepo에서 모든 dependency를 node_modules에 설치하여 유령디펜던시 문제가 발생하였습니다.
pnpm으로 패키지 매니저를 변경하면서 이런 유령디펜던시를 모두 찾아야했습니다.
설치가 필요한 패키지 리스트를 뽑아내기 위해서 만들게 되었습니다.

While using Yarn in a monorepo, all dependencies were installed into the root node_modules, leading to phantom dependency issues.
I decided to switch to PNPM as the package manager and needed to identify all these phantom dependencies.
I created this tool to generate a list of required packages.


## Test

```
git clone git@github.com:devstefancho/phantom-depcheck
yarn link

cd <your-project-directory>
yarn link phantom-depcheck
phantom-depcheck
```


