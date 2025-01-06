# ItTrip

## 지도를 활용하여 여행계획을 생성, 저장하고 관리하는 프로그램입니다

WEB Link : [www.ittrip.life](http://ittrip.life)

### CoWorker
- [Hwan1002](https://github.com/Hwan1002)
- [dlgydyd123](https://github.com/dlgydyd123)
- [Fk1128](https://github.com/Fk1128)
- [HwangHyejin2629](https://github.com/HwangHyejin2629)

### 프로젝트 개요
저희 프로젝트의 컨셉은 "여행 계획에서의 필요한 기능을 모아둔 웹페이지" 입니다.
그래서 저희가 선택한 기능은 날짜별로 관리하는 그 날의 행선지 경로와 체크리스트입니다. 그리고
최대한 UI,UX 적으로 간편하고 빠른 기능 수행 그리고 많은 데이터를 다뤄야 하기에 데이터 최적화 등에 초점을 맞췄습니다.
한 페이지에서 모든 날짜의 행선지,경로 그리고 필요한 물품과 해야할 일 등을 적을 수 있는 체크리스트까지 관리할 수 있습니다.

### 사용한 Open API 
1. Naver Cloud Maps API
2. Naver 지역 검색 API
3. 공공데이터 지역별 관광지 데이터
4. 네이버,구글,카카오 소셜로그인 API

### 주요 기능
- JWT 토큰을 이용한 회원가입,로그인,로그아웃
- 네이버,구글,카카오 OAuth2 소셜로그인
- 공공데이터를 활용한 전국 8도,광역시,특별시 등의 관광지,식당,숙박업소 추천
- 여행의 제목과 시작,끝 날짜를 입력 받아 해당 여행의 데이터를 날짜 수만큼 생성 및 관리
- 지역 검색 API를 활용해 검색한 상호명을 통해 지번주소 가져오기
- 출발지,목적지 그리고 경유지(선택사항,최대 15개) 를 입력하여 경로 요청해 지도에 경로선,소요시간,거리 표시
- 여행마다 체크리스트를 관리하여 해당 여행에서 필요한 사항들을 체크,수정 하면서 관리
- 저장한 여행 데이터는 My Plan에서 읽기,수정,삭제 모두 가능
- React로 인한 실시간 데이터 렌더링
- Axios와 REST API로 클라이언트와 서버 간의 연동
- 화면 크기에 따라지는 반응형 디자인
-  React-Responsive 라이브러리를 활용해 모바일환경에서의 화면 크기 구현

### 기술스택 & 라이브러리
- BackEnd : Java, MySQL, JWT, SpringBoot, JPA, OAuth2
- FrontEnd : Java Script, Html, Css, React, node.js, Axios, 
- Build & Deploy : AWS, Gradle, npm, Nginx, ubuntu
