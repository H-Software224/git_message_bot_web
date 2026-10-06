# PRD: Git Messenger Bot (Git 메신저 Agent 서비스)

| 항목 | 내용 |
|---|---|
| 문서명 | Git Messenger Bot PRD |
| 대상 Repository | https://github.com/H-Software224/git_message_bot_web.git |
| 작성일 | 2026-08-02 |
| 작성자 | Ju Sang Han |
| 상태 | Draft v1.0 |

## 1. 개요 (Overview)

Git Messenger Bot은 사용자가 지정한 GitHub Repository에 대해 Agent가 직접 Git 명령어(status, add, commit, push, merge 등)와 GitHub 기능(Issues, Pull Request, Actions)을 실행하고, 그 결과와 진행 현황을 메신저(웹/채팅)로 실시간 알려주는 서비스다. 개발자가 터미널을 오가며 반복적으로 확인하던 Git 상태 체크와 협업 커뮤니케이션을, Agent에게 위임하고 메신저로 보고받는 방식으로 전환하는 것이 핵심이다.

## 2. 문제 정의 (Problem Statement)

개발자는 하루에도 여러 번 `git status`, `git log`, GitHub Issues/PR 페이지를 오가며 프로젝트 현황을 확인한다. 여러 Repository를 동시에 관리하거나, 팀 협업 중 Collaborator에게 PR/Merge 요청을 알려야 할 때 이 과정은 반복적이고 맥락 전환 비용이 크다. 또한 커밋/푸시/머지 같은 실행 작업과, 그 결과를 팀에 공지하는 작업이 분리되어 있어 "실행 후 알림"까지 수동으로 처리해야 한다.

## 3. 목표 (Goals)

- 사용자가 지정한 Repository 내에서 Agent가 파일/폴더 단위로 변경사항을 파악하고 직접 Git 명령을 실행하게 한다.
- Git 명령 실행 결과, Issue/PR 현황, Actions 스케줄 실행 결과를 메신저(웹 알림 포함)로 실시간 전달한다.
- 사용자가 매번 CLI를 열지 않아도 대화형으로 원하는 Git 작업을 선택·실행·확인할 수 있게 한다.

### Non-Goals (범위 제외)

- Git 명령의 완전 자동화(사용자 승인 없는 자동 push/merge)는 v1에서 제외한다.
- GitHub 외 다른 VCS 플랫폼(GitLab, Bitbucket) 지원은 v1 범위에 포함하지 않는다.

## 4. 대상 사용자 (Target Users)

- 여러 Repository를 관리하며 진행 상황을 자주 확인해야 하는 개인 개발자 및 프로젝트 오너
- Collaborator에게 PR/Merge 요청을 자주 보내야 하는 팀 리드
- CI/CD(GitHub Actions) 실행 결과를 실시간으로 챙겨야 하는 개발팀

## 5. 핵심 기능 (Core Features)

### 5.1 Git Status 현황 조회
지정된 Repository의 `git status`를 실행해 변경된 파일, 스테이징 여부, 브랜치 상태(ahead/behind)를 파악하고 요약된 형태로 보여준다.

### 5.2 Repository 파일/폴더 구조 파악 (Code 탐색)
Repository 전체의 파일 및 폴더 구성을 스캔해 트리 구조로 제공하고, 특정 파일의 변경 이력이나 내용을 조회할 수 있게 한다.

### 5.3 Git 명령 선택 실행 (add / commit / push / merge 등)
사용자가 실행할 Git 명령(add, commit, push, merge, pull, branch, checkout 등)을 메뉴 또는 대화형으로 선택하면, Agent가 해당 명령을 대상 Repository에서 실행한다.

### 5.4 선택된 기능의 실행 및 결과 반영
선택한 명령에 필요한 파라미터(대상 파일, 커밋 메시지, 브랜치명 등)를 확인받은 뒤 실행하고, 실행 로그와 성공/실패 여부를 반환한다.

### 5.5 GitHub Issues 조회 및 알림
열려 있는 Issue 목록을 조회하고, 사용자가 선택한 Issue의 내용을 파악해 공지가 필요한 항목을 메신저로 전달한다.

### 5.6 Pull Request 생성/확인 및 Merge 요청
새 PR을 생성하거나 기존 PR 상태(리뷰 여부, 충돌 여부)를 확인하고, Merge가 필요한 PR에 대해 Collaborator에게 메신저로 요청 메시지를 보낸다.

### 5.7 GitHub Actions 스케줄링 연동
GitHub Actions 워크플로우의 실행 스케줄(cron)을 확인하거나 설정하고, 언제 어떤 워크플로우가 실행될지 파악할 수 있게 한다.

### 5.8 실시간 완료 알림 (메신저 알림)
Git 명령 실행, PR/Issue 처리, Actions 실행이 완료되면 결과를 즉시 메신저(웹 알림/채팅)로 발송한다.

## 6. 사용자 스토리 (User Stories)

- 사용자로서, 나는 특정 Repository의 현재 변경사항을 메신저에서 바로 확인하고 싶다. 터미널을 열지 않아도 되기 때문이다.
- 사용자로서, 나는 커밋할 파일을 선택하고 커밋 메시지만 입력하면 add/commit/push가 순서대로 실행되길 원한다.
- 팀 리드로서, 나는 PR이 준비되면 Collaborator에게 자동으로 Merge 요청 메시지가 전달되길 원한다.
- 사용자로서, 나는 GitHub Actions가 언제 실행되는지, 실행 결과가 어땠는지 메신저로 알림받고 싶다.
- 사용자로서, 나는 열려 있는 Issue 중 공지가 필요한 항목을 선택해 팀에 전달하고 싶다.

## 7. 기능별 흐름 (Flow)

1. 사용자가 메신저(웹)에서 Repository를 선택한다.
2. Agent가 `git status`와 파일/폴더 구조를 조회해 현재 상태를 요약해 보여준다.
3. 사용자가 실행할 Git 명령(예: commit)을 메뉴에서 선택한다.
4. Agent가 필요한 입력값(커밋 메시지, 대상 파일 등)을 되묻는다.
5. Agent가 해당 Git 명령을 실행한다.
6. 실행 결과(성공/실패, 로그)를 메신저로 즉시 알린다.
7. (선택) PR/Issue/Actions 관련 작업일 경우, 관련 Collaborator에게 알림을 추가로 전송한다.

## 8. 기술 아키텍처 개요 (Technical Architecture)

- **Git 실행 계층**: 대상 Repository를 로컬(또는 격리된 워크스페이스)에 clone/pull한 뒤 `git` CLI 명령을 실행하는 Executor 모듈.
- **GitHub API 연동 계층**: Issues, Pull Requests, Actions 조회/생성은 GitHub REST API 또는 GitHub App(Webhook 포함)을 통해 처리.
- **Actions 스케줄 연동**: 워크플로우 파일(`.github/workflows/*.yml`)의 `schedule` 트리거를 조회/제안하고, Actions 실행 상태를 API로 폴링 또는 Webhook으로 수신.
- **메신저/알림 계층**: 웹 UI 알림 및 외부 메신저(Slack, Discord, Telegram 등) 연동을 통한 실시간 메시지 발송.
- **인증/권한 계층**: GitHub OAuth 또는 Personal Access Token 기반 인증, Repository별 접근 권한 관리.
- **대상 Repository**: https://github.com/H-Software224/git_message_bot_web.git (초기 개발 및 검증 대상)

## 9. 알림 및 권한 정책

- 파괴적 명령(force push, merge, branch 삭제 등)은 실행 전 반드시 사용자 확인을 요구한다.
- 모든 실행 결과(성공/실패 포함)는 예외 없이 메신저로 통지한다.
- Collaborator에게 보내는 Merge 요청 메시지에는 PR 링크, 변경 요약, 요청자 정보를 포함한다.

## 10. 성공 지표 (Success Metrics)

- Git 명령 실행 요청 대비 성공률
- 명령 실행 완료부터 메신저 알림 도달까지의 평균 지연 시간
- PR Merge 요청 후 Collaborator 응답까지 걸리는 평균 시간 단축률
- 주간 활성 사용 Repository 수

## 11. 리스크 및 고려사항 (Risks & Considerations)

- **권한 오남용 리스크**: Agent가 잘못된 대상 Repository나 브랜치에 push/merge할 가능성 → 실행 전 대상 확인 단계 필수.
- **인증 토큰 보안**: GitHub 토큰 저장 및 갱신 방식에 대한 보안 설계 필요.
- **동시성 이슈**: 여러 사용자가 같은 Repository에 동시에 명령을 실행할 경우 충돌 가능성.
- **API Rate Limit**: GitHub API 호출 빈도 제한에 대한 대응(캐싱, 폴링 주기 조정) 필요.

## 12. 향후 로드맵 (Future Roadmap)

- v1: Git status/명령 실행, Issue 조회, PR 생성/확인, Actions 스케줄 확인, 웹 알림
- v2: 다중 메신저(Slack/Discord/Telegram) 동시 연동, 자연어 기반 명령 해석
- v3: 여러 Repository 동시 모니터링 대시보드, 자동화 규칙(특정 조건에서 자동 알림/자동 PR 생성)
