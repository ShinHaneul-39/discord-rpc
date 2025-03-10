# Discord RPC Manager

## 소개
`Discord RPC Manager`는 여러분의 Discord Rich Presence 상태를 손쉽게 설정하고 업데이트할 수 있는 명령줄 도구입니다.  
이 프로그램을 사용하면 명령어를 통해 Discord 프로필에 표시되는 활동 상태, 게임 진행 상황 등 다양한 정보를 실시간으로 변경할 수 있습니다.

**Rich Presence란?**  
Rich Presence는 Discord에서 사용자의 활동을 보다 풍부하게 보여주기 위해 제공하는 기능입니다. 예를 들어, "즐거운 시간 보내세요!"나 "새로운 레벨 도전 중"과 같은 상태 메시지를 표시할 수 있습니다.

## 주요 기능
- **상세 메시지 설정**: `details` 명령어로 자세한 활동 설명을 입력합니다.
- **간단 상태 텍스트**: `state` 명령어를 통해 간단한 상태 메시지를 설정합니다.
- **시작 시간 설정**: `timestamp` 명령어로 활동 시작 시간을 밀리초 단위로 지정합니다.
- **이미지 설정**:  
  - **큰 이미지**: `largeImage` 명령어로 큰 이미지의 키 또는 URL과 설명 텍스트를 설정합니다.
  - **작은 이미지**: `smallImage` 명령어로 작은 이미지의 키 또는 URL과 설명 텍스트를 설정합니다.
- **버튼 추가**: `addButton` 명령어로 최대 두 개의 버튼을 추가할 수 있으며, 버튼에는 라벨과 연결할 URL을 지정할 수 있습니다.
- **버튼 초기화**: `clearButtons` 명령어로 추가한 모든 버튼을 삭제합니다.
- **상태 유형 변경**: `setStateType` 명령어로 활동 유형(예: playing, listening, watching, streaming)을 설정합니다.
- **상태 저장 및 불러오기**:  
  - `save` 명령어로 현재 상태를 JSON 파일로 저장하고,  
  - `load` 명령어로 저장된 상태 파일을 불러올 수 있습니다.
- **상태 초기화**: `reset` 명령어로 모든 설정을 기본값으로 되돌립니다.
- **도움말 보기**: `help` 또는 `?` 명령어로 사용 가능한 명령어 목록과 사용법을 확인할 수 있습니다.
- **프로그램 종료**: `exit` 명령어로 프로그램을 종료합니다.

## 설치 전 요구 사항
- **Node.js**  
  프로그램 실행을 위해 Node.js가 필요합니다.  
  Node.js가 설치되어 있지 않다면 [Node.js 공식 사이트](https://nodejs.org/)에서 설치해 주세요.
- **Git** (선택 사항)  
  레포지토리를 클론할 경우 필요합니다.

## 설치 및 실행 방법

### 1. 레포지토리 클론
터미널(또는 명령 프롬프트)을 열고 아래 명령어를 입력합니다.
```bash
git clone <레포지토리 URL>
cd <레포지토리 폴더>
```

### 2. 의존성 설치
프로젝트 폴더에서 다음 명령어를 실행하여 필요한 모듈들을 설치합니다.
```bash
npm install
```

### 3. Discord 클라이언트 ID 설정
프로그램 실행 전 `clientIds.json` 파일에 Discord 클라이언트 정보를 입력해야 합니다.
- 프로그램이 처음 실행될 때 이 파일이 없으면 자동으로 생성되지만, 빈 상태로 생성됩니다.
- 파일 예시는 아래와 같습니다:
  ```json
  {
      "clients": [
          {
              "name": "My Discord App",
              "clientId": "123456789012345678"
          }
      ]
  }
  ```
- 위 파일에서 `"clientId"` 항목에 여러분의 Discord 애플리케이션 Client ID를 입력하고, `"name"`에는 해당 애플리케이션의 이름을 입력합니다.

### 4. 프로그램 실행
모든 설정이 완료되면 터미널에서 아래 명령어로 프로그램을 실행합니다.
```bash
node index.js
```
실행 후, 콘솔에 클라이언트 목록이 표시됩니다. 원하는 클라이언트의 번호를 입력하면 해당 클라이언트로 Discord에 연결이 시작됩니다.

## 사용법
프로그램 실행 후, 명령어를 입력하여 Discord Rich Presence 상태를 변경할 수 있습니다. 아래는 각 명령어의 사용 예시입니다.

### 명령어 목록 및 예시

- **상세 메시지 설정**  
  **명령어:**  
  ```
  details:새로운 활동을 즐기고 있습니다!
  ```  
  **설명:** 자세한 활동 설명을 업데이트합니다.

- **간단 상태 텍스트 설정**  
  **명령어:**  
  ```
  state:즐거운 시간 보내세요!
  ```  
  **설명:** 간단한 상태 메시지를 설정합니다.

- **시작 타임스탬프 설정**  
  **명령어:**  
  ```
  timestamp:1672531200000
  ```  
  **설명:** 밀리초 단위의 시작 시간을 지정합니다. (예: 2023년 1월 1일 00:00:00)

- **큰 이미지 설정**  
  **명령어 (에셋 키 사용):**  
  ```
  largeImage:newImageKey || 이미지 설명
  ```  
  **명령어 (URL 사용):**  
  ```
  largeImage:https://example.com/image.png || 이미지 설명
  ```  
  **설명:** 큰 이미지의 키 또는 URL과 함께 설명 텍스트를 설정합니다.

- **작은 이미지 설정**  
  **명령어 (에셋 키 사용):**  
  ```
  smallImage:newSmallImageKey || 작은 이미지 설명
  ```  
  **명령어 (URL 사용):**  
  ```
  smallImage:https://example.com/image_small.png || 작은 이미지 설명
  ```  
  **설명:** 작은 이미지의 키 또는 URL과 함께 설명 텍스트를 설정합니다.

- **버튼 추가**  
  **명령어:**  
  ```
  addButton:버튼 라벨 || https://example.com
  ```  
  **설명:** 최대 2개의 버튼을 추가할 수 있으며, 버튼에 표시될 라벨과 버튼 클릭 시 열릴 URL을 지정합니다.

- **버튼 초기화**  
  **명령어:**  
  ```
  clearButtons
  ```  
  **설명:** 추가된 모든 버튼을 삭제합니다.

- **상태 유형 변경**  
  **명령어:**  
  ```
  setStateType:playing
  ```  
  **설명:** 활동 유형을 설정합니다. 가능한 값은 `playing`, `listening`, `watching`, `streaming`입니다.

- **상태 저장**  
  **명령어:**  
  ```
  save:myState.json
  ```  
  **설명:** 현재 RPC 상태를 `saves` 폴더 내의 JSON 파일로 저장합니다.

- **상태 불러오기**  
  **명령어:**  
  ```
  load:myState.json
  ```  
  **설명:** 저장된 JSON 파일에서 RPC 상태를 불러옵니다.

- **상태 초기화**  
  **명령어:**  
  ```
  reset
  ```  
  **설명:** 모든 설정을 기본값으로 초기화합니다.

- **도움말 보기**  
  **명령어:**  
  ```
  help
  ```  
  또는 특정 명령어의 도움말 확인:
  ```
  help details
  ```  
  **설명:** 전체 명령어 목록 또는 특정 명령어의 사용법을 확인할 수 있습니다.

- **프로그램 종료**  
  **명령어:**  
  ```
  exit
  ```  
  **설명:** 프로그램을 종료합니다.

## 로그 기록
프로그램은 RPC 상태가 변경될 때마다 상태와 변경 시간을 `history.log` 파일에 기록합니다.  
이 파일을 통해 이전의 상태 변경 내역을 확인할 수 있습니다.

## 코드 구조 및 관리
- **Logger**  
  다양한 로그 메시지를 ANSI 컬러로 출력하여 사용자와 개발자 모두가 상태를 쉽게 확인할 수 있도록 합니다.
  
- **유틸리티 함수**  
  URL과 이미지 URL의 유효성을 검사하는 함수를 포함하여, 잘못된 입력을 방지합니다.

- **RPCManager 클래스**  
  프로그램의 주요 로직을 담당하며, 명령어 처리, 파일 입출력, Discord RPC 연결 및 업데이트를 수행합니다.

## 자주 묻는 질문 (FAQ)
- **Q: `clientIds.json` 파일이 없다고 뜹니다.**  
  **A:** 프로그램이 처음 실행될 때 이 파일이 없으면 자동으로 생성됩니다. 하지만 빈 파일로 생성되므로, Discord 클라이언트 정보를 추가한 후 다시 실행해 주세요.

- **Q: 버튼을 2개 이상 추가할 수 없습니다.**  
  **A:** Discord RPC는 최대 2개의 버튼만 지원하므로 2개 이상의 버튼을 추가할 수 없습니다.

- **Q: 이미지 URL을 사용했는데 이미지가 표시되지 않습니다.**  
  **A:** 이미지 URL은 jpg, jpeg, png, gif, webp 확장자를 가진 파일만 지원됩니다.

## 기여 방법
프로젝트에 기여하고 싶으신 분은 이슈를 생성하거나, 수정 사항을 포함한 풀 리퀘스트(PR)를 보내주시기 바랍니다.

## 라이선스
이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

## 연락처
문의 사항이나 건의 사항이 있으시면 [helloworld10042@naver.com](mailto:helloworld10042@naver.com)으로 연락해 주세요.
