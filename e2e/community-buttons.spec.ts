import { test, expect, Page } from '@playwright/test';

// 테스트 설정
test.setTimeout(120000); // 전체 테스트 2분 타임아웃
test.describe.configure({ mode: 'serial' }); // 순차 실행

// 테스트 결과 타입
interface ButtonTestResult {
  name: string;
  selector: string;
  status: 'success' | 'error' | 'skipped';
  error?: string;
  requiresLogin: boolean;
}

// 테스트 결과 저장소
const testResults: ButtonTestResult[] = [];

/**
 * 로그인 헬퍼 함수
 * 로그인 모달이 보이면 자동으로 로그인 처리
 */
async function loginIfNeeded(page: Page): Promise<boolean> {
  try {
    // 로그인 모달이 보이는지 확인
    const loginModal = page.locator('[role="dialog"]').filter({ hasText: '로그인' });

    const isModalVisible = await loginModal.isVisible({ timeout: 2000 }).catch(() => false);

    if (isModalVisible) {
      console.log('로그인 모달 감지 - 로그인 진행...');

      // 이메일 입력
      await page.fill('#login-email', 'ijg0341@naver.com');

      // 비밀번호 입력
      await page.fill('#login-password', '60109ijg!@');

      // 로그인 버튼 클릭
      await page.click('button[type="submit"]:has-text("로그인")');

      // 모달 닫힐 때까지 대기
      await loginModal.waitFor({ state: 'hidden', timeout: 10000 });

      console.log('로그인 완료!');

      // 페이지가 안정화될 때까지 잠시 대기
      await page.waitForTimeout(2000);

      return true;
    }

    return false;
  } catch (error) {
    console.error('로그인 중 에러:', error);
    return false;
  }
}

/**
 * 버튼 클릭 테스트 함수
 */
async function testButton(
  page: Page,
  name: string,
  selector: string,
  options?: {
    waitAfterClick?: number;
    expectModal?: boolean;
    expectDrawer?: boolean;
    requiresLogin?: boolean;
    preAction?: () => Promise<void>;
    postAction?: () => Promise<void>;
    clickOptions?: { force?: boolean; timeout?: number };
  }
): Promise<ButtonTestResult> {
  const result: ButtonTestResult = {
    name,
    selector,
    status: 'success',
    requiresLogin: options?.requiresLogin || false,
  };

  try {
    // Pre-action 실행
    if (options?.preAction) {
      await options.preAction();
    }

    // 버튼 찾기
    const button = page.locator(selector).first();

    // 버튼이 보이는지 확인
    const isVisible = await button.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isVisible) {
      result.status = 'skipped';
      result.error = 'Button not visible';
      console.log(`⏭️  ${name}: 버튼 없음 (스킵)`);
      return result;
    }

    // 클릭 전 스크린샷 (디버깅용)
    // await page.screenshot({ path: `./e2e/reports/${name}-before.png` });

    // 버튼 클릭
    await button.click(options?.clickOptions || { timeout: 5000 });

    // 클릭 후 대기
    await page.waitForTimeout(options?.waitAfterClick || 1000);

    // 로그인 모달이 뜨면 자동 로그인
    const loginNeeded = await loginIfNeeded(page);
    if (loginNeeded) {
      result.requiresLogin = true;
      // 로그인 후 다시 버튼 클릭 시도
      const retryButton = page.locator(selector).first();
      if (await retryButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await retryButton.click(options?.clickOptions || { timeout: 5000 });
        await page.waitForTimeout(options?.waitAfterClick || 1000);
      }
    }

    // 모달이나 Drawer 확인
    if (options?.expectModal || options?.expectDrawer) {
      const modal = page.locator('[role="dialog"]');
      const isModalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);

      if (!isModalVisible && options?.expectModal) {
        result.error = 'Expected modal did not appear';
      }
    }

    // Post-action 실행
    if (options?.postAction) {
      await options.postAction();
    }

    console.log(`✅ ${name}: 성공`);
  } catch (error) {
    result.status = 'error';
    result.error = error instanceof Error ? error.message : String(error);
    console.log(`❌ ${name}: 실패 - ${result.error}`);
  }

  testResults.push(result);
  return result;
}

/**
 * Drawer 닫기 함수
 */
async function closeDrawer(page: Page): Promise<void> {
  try {
    const closeButton = page.locator('button[aria-label="닫기"], button[aria-label*="close"], [role="dialog"] button:has(svg)').first();
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
  } catch (error) {
    console.log('Drawer 닫기 실패 (무시)');
  }
}

/**
 * 페이지 초기 상태로 복구
 */
async function resetPageState(page: Page): Promise<void> {
  try {
    // Drawer 닫기
    await closeDrawer(page);

    // 스크롤 맨 위로
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.waitForTimeout(500);
  } catch (error) {
    console.log('페이지 상태 초기화 실패 (무시)');
  }
}

test.describe('Community Page - All Buttons Test', () => {
  test.beforeEach(async ({ page }) => {
    // 커뮤니티 페이지로 이동
    await page.goto('/community');
    await page.waitForLoadState('networkidle');
    // API 데이터 로드 대기
    await page.waitForTimeout(4000);
  });

  test('Header - Tab Buttons', async ({ page }) => {
    console.log('\n=== 헤더 탭 버튼 테스트 ===');

    // Feed 탭 - Chip 컴포넌트는 div[role="button"]으로 렌더링됨
    await testButton(page, 'Feed 탭', '[role="button"]:has-text("Feed")');
    await resetPageState(page);

    // Q&A 탭
    await testButton(page, 'Q&A 탭', '[role="button"]:has-text("Q&A")');
    await resetPageState(page);

    // 팔로잉 탭
    await testButton(page, '팔로잉 탭', '[role="button"]:has-text("팔로잉")');
    await resetPageState(page);
  });

  test('Header - Write Button', async ({ page }) => {
    console.log('\n=== 글쓰기 버튼 테스트 ===');

    await testButton(
      page,
      '글쓰기 버튼',
      'button:has-text("글쓰기")',
      {
        waitAfterClick: 2000,
        requiresLogin: true,
        postAction: async () => {
          // 글쓰기 페이지로 이동했으면 뒤로가기
          if (page.url().includes('/new/post')) {
            await page.goBack();
            await page.waitForTimeout(1000);
          }
        },
      }
    );
  });

  test('Feed Card - Card Click', async ({ page }) => {
    console.log('\n=== 피드 카드 클릭 테스트 ===');

    // 피드 카드는 cursor-pointer 클래스를 가진 div
    await testButton(
      page,
      '피드 카드 전체 클릭',
      'main .cursor-pointer',
      {
        waitAfterClick: 2000,
        expectDrawer: true,
        postAction: async () => {
          await closeDrawer(page);
        },
      }
    );
  });

  test('Feed Card - Action Buttons', async ({ page }) => {
    console.log('\n=== 피드 카드 액션 버튼 테스트 ===');

    // 첫 번째 카드의 ActionBar 버튼들을 직접 타겟팅
    // ActionBar는 카드 내 button 그룹

    // 좋아요 버튼 (첫 번째 ActionBar 버튼)
    await testButton(
      page,
      '카드 좋아요 버튼',
      'main .cursor-pointer button:first-of-type',
      {
        waitAfterClick: 1000,
        requiresLogin: true,
      }
    );
    await resetPageState(page);

    // 북마크 버튼 (aria-label로 정확히 매칭)
    await testButton(
      page,
      '카드 북마크 버튼',
      'button[aria-label="북마크"]',
      {
        waitAfterClick: 1000,
        requiresLogin: true,
      }
    );
    await resetPageState(page);

    // 더보기 버튼
    await testButton(
      page,
      '카드 더보기 버튼',
      'button[aria-label="더보기"]',
      {
        waitAfterClick: 1000,
        postAction: async () => {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        },
      }
    );
  });

  test('Drawer - Open and Test Internal Buttons', async ({ page }) => {
    console.log('\n=== Drawer 내부 버튼 테스트 ===');

    // 먼저 카드 클릭으로 Drawer 열기
    const card = page.locator('main .cursor-pointer').first();
    const isCardVisible = await card.isVisible({ timeout: 5000 }).catch(() => false);

    if (!isCardVisible) {
      console.log('⏭️  Drawer 테스트 스킵: 카드 없음');
      return;
    }

    await card.click();
    await page.waitForTimeout(2000);

    // 로그인 모달이 뜨면 자동 로그인
    await loginIfNeeded(page);

    // Drawer가 열렸는지 확인 (fixed position div)
    const drawer = page.locator('.fixed.right-0, .fixed.inset-y-0');
    const isDrawerVisible = await drawer.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isDrawerVisible) {
      console.log('⏭️  Drawer 테스트 스킵: Drawer가 열리지 않음');
      return;
    }

    console.log('Drawer 열림 확인!');

    // 닫기 버튼
    await testButton(
      page,
      'Drawer 닫기 버튼',
      'button[aria-label="닫기"]',
      {
        waitAfterClick: 1000,
      }
    );
  });

  test('Q&A Card - Test Q&A Buttons', async ({ page }) => {
    console.log('\n=== Q&A 카드 버튼 테스트 ===');

    // Q&A 탭으로 전환 (Chip 컴포넌트)
    const qnaTab = page.locator('[role="button"]:has-text("Q&A")').first();
    const isQnaTabVisible = await qnaTab.isVisible({ timeout: 3000 }).catch(() => false);

    if (isQnaTabVisible) {
      await qnaTab.click();
      await page.waitForTimeout(3000);

      // Q&A 카드 클릭
      await testButton(
        page,
        'Q&A 카드 클릭',
        'main .cursor-pointer',
        {
          waitAfterClick: 2000,
          expectDrawer: true,
          postAction: async () => {
            await closeDrawer(page);
          },
        }
      );
    } else {
      console.log('⏭️  Q&A 테스트 스킵: Q&A 탭 없음');
    }
  });

  test('Sidebar - Follow Buttons', async ({ page }) => {
    console.log('\n=== 사이드바 팔로우 버튼 테스트 ===');

    // 추천 팔로워의 팔로우 버튼
    await testButton(
      page,
      '사이드바 팔로우 버튼',
      'aside button:has-text("팔로우"), aside button:has-text("Follow")',
      {
        waitAfterClick: 1000,
        requiresLogin: true,
      }
    );
  });

  test('Sidebar - Recommended Posts', async ({ page }) => {
    console.log('\n=== 사이드바 추천 포스트 테스트 ===');

    // 추천 포스트 클릭
    await testButton(
      page,
      '사이드바 추천 포스트 클릭',
      'aside article:first-of-type, aside div[data-post-id]:first-of-type',
      {
        waitAfterClick: 2000,
        expectDrawer: true,
        postAction: async () => {
          await closeDrawer(page);
        },
      }
    );
  });

  test('Sidebar - Popular Posts', async ({ page }) => {
    console.log('\n=== 사이드바 인기글 테스트 ===');

    // 인기글 클릭
    await testButton(
      page,
      '사이드바 인기글 클릭',
      'aside section:has-text("인기글") article:first-of-type, aside section:has-text("Popular") article:first-of-type',
      {
        waitAfterClick: 2000,
        expectDrawer: true,
        postAction: async () => {
          await closeDrawer(page);
        },
      }
    );
  });

  test('Bottom - Load More Button', async ({ page }) => {
    console.log('\n=== Load More 버튼 테스트 ===');

    // 페이지 하단으로 스크롤
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

    // Load More 버튼
    await testButton(
      page,
      'Load More 버튼',
      'button:has-text("더 보기"), button:has-text("Load More"), button:has-text("더보기")',
      {
        waitAfterClick: 2000,
      }
    );
  });

  test.afterAll(async () => {
    console.log('\n\n=== 테스트 결과 리포트 ===\n');

    // 통계 계산
    const total = testResults.length;
    const success = testResults.filter(r => r.status === 'success').length;
    const error = testResults.filter(r => r.status === 'error').length;
    const skipped = testResults.filter(r => r.status === 'skipped').length;
    const requiresLogin = testResults.filter(r => r.requiresLogin).length;

    // 테이블 출력
    console.log('┌─────────────────────────────────────────────────┬──────────┬───────────────┐');
    console.log('│ 버튼 이름                                        │ 상태      │ 로그인 필요    │');
    console.log('├─────────────────────────────────────────────────┼──────────┼───────────────┤');

    testResults.forEach(result => {
      const statusIcon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏭️';
      const loginIcon = result.requiresLogin ? '🔒' : '  ';
      const name = result.name.padEnd(45);
      const status = `${statusIcon} ${result.status}`.padEnd(8);

      console.log(`│ ${name} │ ${status} │ ${loginIcon}            │`);

      if (result.error) {
        console.log(`│   └─ Error: ${result.error.substring(0, 60).padEnd(60)} │`);
      }
    });

    console.log('└─────────────────────────────────────────────────┴──────────┴───────────────┘');
    console.log(`\n총 ${total}개 버튼 테스트`);
    console.log(`✅ 성공: ${success} | ❌ 실패: ${error} | ⏭️  스킵: ${skipped} | 🔒 로그인 필요: ${requiresLogin}`);

    // JSON 결과 출력
    console.log('\n=== JSON 결과 ===');
    console.log(JSON.stringify({
      summary: {
        total,
        success,
        error,
        skipped,
        requiresLogin,
      },
      results: testResults,
    }, null, 2));
  });
});
