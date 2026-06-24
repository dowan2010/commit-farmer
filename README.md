# 🌱 commit-farmer

GitHub 잔디를 자동으로 심어주는 CLI 도구

명령어 하나로 매일 자동 커밋되는 GitHub repo를 만들 수 있습니다.

---

## 사전 준비

- [Node.js](https://nodejs.org) 설치 (v18 이상)
- GitHub 계정

---

## 사용법

터미널을 열고 아래 명령어를 입력하세요.

```bash
npx commit-farmer
```

---

## 단계별 가이드

### 1단계 — GitHub 토큰 발급

토큰은 commit-farmer가 내 GitHub 계정에 접근할 수 있도록 허용하는 비밀번호입니다.

1. https://github.com/settings/tokens/new 접속
2. 아래와 같이 입력

| 항목 | 값 |
|---|---|
| Note | commit-farmer (아무 이름이나 가능) |
| Expiration | No expiration |

3. 권한(Select scopes) 체크

- `repo` — 전체 체크 ✅
- `workflow` — 체크 ✅

4. 하단 **Generate token** 클릭
5. 초록색으로 표시된 토큰 복사 (이 페이지를 벗어나면 다시 볼 수 없음)

> ⚠️ 토큰은 절대 다른 사람에게 공유하지 마세요.

---

### 2단계 — commit-farmer 실행

```bash
npx commit-farmer
```

실행하면 아래 순서로 입력을 요청합니다.

**토큰 붙여넣기**
```
토큰 붙여넣기: ghp_xxxxxxxxxxxxxxxxxxxx
```
1단계에서 복사한 토큰을 붙여넣으세요.

**repo 이름**
```
repo 이름 (기본: my-til):
```
생성될 GitHub repo 이름입니다. 엔터를 치면 `my-til`로 생성됩니다.

**커밋 이름**
```
커밋 이름 (기본: 홍길동):
```
커밋에 표시될 이름입니다. 엔터를 치면 GitHub 프로필 이름으로 설정됩니다.

**커밋 이메일**
```
커밋 이메일:
```
GitHub 가입 이메일을 입력하세요.

---

### 3단계 — 완료 확인

입력이 끝나면 자동으로 repo가 생성됩니다.

```
✅ 완료!

👉 https://github.com/유저이름/my-til

이제 매일 12시에 자동으로 커밋됩니다.
지금 바로 실행하려면 repo → Actions 탭 → Auto Commit → Run workflow
```

출력된 링크로 접속해서 repo가 생성되었는지 확인하세요.

---

### 4단계 — 지금 바로 실행 (선택)

매일 12시에 자동 실행되지만, 지금 바로 테스트하고 싶다면:

1. 생성된 repo 접속
2. 상단 **Actions** 탭 클릭
3. 좌측 **Auto Commit** 클릭
4. **Run workflow** 버튼 클릭
5. 초록색 체크 표시가 뜨면 성공

---

## 자주 묻는 질문

**Q. Node.js가 설치되어 있는지 모르겠어요.**

터미널에서 아래 명령어를 실행해보세요.
```bash
node -v
```
버전 번호가 나오면 설치된 것입니다. 아무것도 안 나오면 https://nodejs.org 에서 설치하세요.

**Q. 잔디가 안 심어져요.**

GitHub 프로필 설정에서 이메일이 공개되어 있어야 잔디가 반영됩니다.
Settings → Emails → 이메일 공개 여부 확인

**Q. 토큰을 잃어버렸어요.**

https://github.com/settings/tokens 에서 기존 토큰을 삭제하고 새로 발급받으세요.

**Q. repo를 삭제하고 싶어요.**

repo 페이지 → Settings → 하단 Delete this repository

---

## 문의

문제가 생기면 [Issues](../../issues)에 남겨주세요.
