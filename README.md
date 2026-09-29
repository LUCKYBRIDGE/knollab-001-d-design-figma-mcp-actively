# Knollab 001 · 실험 D

GitHub Pages의 루트 `index.html`은 실험과 버전을 고르는 화면입니다. 실험 D는 현재 **버전 1만** 완성되어 있으며, 체험 화면은 `versions/v1/index.html`에서 그대로 불러옵니다. 다른 버전 번호로 접속하면 주소가 버전 1로 바뀝니다.

`versions/v1/`은 완성된 버전 1 원본입니다. 이전 루트의 미완성 버전 2 초안은 Git 태그 `archive/pre-switcher-2026-09-30`에 보관했습니다. 로컬 `archive/root-v2-draft/`에도 원본 사본을 두되 Pages 공개 경로에는 배포하지 않습니다. 루트에 남은 `script.js`, `style.css`, `DESIGN.md`도 기존 파일이며 새 전환 화면에서는 불러오지 않습니다.

원본 v1은 화면 최소 너비가 720px이라 작은 휴대전화 화면에서 내용이 잘립니다. `versions/v1/`은 그대로 두고, 체험용 `experience/v1/` 사본에 모바일 반응형 CSS만 추가했습니다. 데스크톱 내용과 주문 흐름은 원본과 같습니다.

GitHub Pages는 리포지토리 루트를 배포 대상으로 설정하면 됩니다. 별도 빌드나 외부 의존성은 없습니다.
