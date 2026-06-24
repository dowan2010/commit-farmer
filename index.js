#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, a => resolve(a.trim())));
}

function apiCall(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'api.github.com',
        path,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'commit-farmer',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(data && {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          }),
        },
      },
      res => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => {
          const parsed = JSON.parse(raw);
          if (res.statusCode >= 400) reject(new Error(parsed.message));
          else resolve(parsed);
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function uploadFile(owner, repo, filePath, content, token) {
  return apiCall('PUT', `/repos/${owner}/${repo}/contents/${filePath}`, token, {
    message: `chore: add ${filePath}`,
    content: Buffer.from(content).toString('base64'),
  });
}

function buildWorkflow(gitName, gitEmail) {
  return `name: Auto Commit

on:
  schedule:
    - cron: '0 3 * * *'    # 매일 12:00 KST (= 03:00 UTC)
  workflow_dispatch:

jobs:
  commit:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - name: Make commits
        run: |
          git config user.name "${gitName}"
          git config user.email "${gitEmail}"

          DATE=$(date -u +"%Y-%m-%d" --date="9 hours")
          LOG_FILE="logs/\${DATE}.md"

          mkdir -p logs

          COUNT=$((RANDOM % 5 + 2))

          for i in $(seq 1 $COUNT); do
            COMMIT_TIME=$(date -u +"%H:%M:%S" --date="9 hours")

            if [ "$i" -eq 1 ]; then
              if [ ! -f "\$LOG_FILE" ]; then
                echo "# TIL - \${DATE}" > "\$LOG_FILE"
                echo "" >> "\$LOG_FILE"
              fi
              echo "- \${COMMIT_TIME} 오늘도 꾸준히" >> "\$LOG_FILE"
              git add "\$LOG_FILE"
              git commit -m "docs: \${DATE} 기록 추가"
            else
              echo "<!-- updated: \${DATE} \${COMMIT_TIME} -->" >> README.md
              git add README.md
              git commit -m "chore: update \${DATE} ($i/$COUNT)"
            fi

            sleep $((RANDOM % 10 + 5))
          done

          git push
`;
}

async function main() {
  console.log('\n🌱 commit-farmer — GitHub 잔디 자동 심기\n');
  console.log('GitHub 토큰이 필요합니다.');
  console.log('발급 주소: https://github.com/settings/tokens/new');
  console.log('  - Note: 아무 이름');
  console.log('  - Expiration: No expiration');
  console.log('  - 권한: repo 전체 체크, workflow 체크\n');

  const token = await ask('토큰 붙여넣기: ');

  let userInfo;
  try {
    userInfo = await apiCall('GET', '/user', token);
  } catch {
    console.error('\n❌ 토큰이 올바르지 않습니다.');
    rl.close();
    process.exit(1);
  }

  console.log(`\n✅ 로그인: ${userInfo.login}\n`);

  const repoName = (await ask('repo 이름 (기본: my-til): ')) || 'my-til';
  const gitName = (await ask(`커밋 이름 (기본: ${userInfo.name || userInfo.login}): `)) || userInfo.name || userInfo.login;
  const gitEmail = (await ask(`커밋 이메일: `)) || userInfo.email || '';

  rl.close();

  if (!gitEmail) {
    console.error('\n❌ 이메일을 입력해주세요.');
    process.exit(1);
  }

  console.log('\nrepo 생성 중...');
  try {
    await apiCall('POST', '/user/repos', token, {
      name: repoName,
      private: false,
      description: '🌱 매일 꾸준히 기록하는 공간',
      auto_init: false,
    });
  } catch (e) {
    console.error(`\n❌ repo 생성 실패: ${e.message}`);
    process.exit(1);
  }

  const owner = userInfo.login;

  console.log('파일 업로드 중...');
  try {
    await uploadFile(owner, repoName, 'README.md', '# TIL (Today I Learned)\n\n매일 꾸준히 기록하는 공간\n', token);
    await uploadFile(owner, repoName, '.github/workflows/auto_commit.yml', buildWorkflow(gitName, gitEmail), token);
    await uploadFile(owner, repoName, 'logs/.gitkeep', '', token);
  } catch (e) {
    console.error(`\n❌ 파일 업로드 실패: ${e.message}`);
    process.exit(1);
  }

  console.log(`\n✅ 완료!`);
  console.log(`\n👉 https://github.com/${owner}/${repoName}`);
  console.log('\n이제 매일 12시에 자동으로 커밋됩니다.');
  console.log('지금 바로 실행하려면 repo → Actions 탭 → Auto Commit → Run workflow\n');
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
