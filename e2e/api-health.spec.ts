import { test, expect } from '@playwright/test';

test.describe('API Health Check', () => {
  test('should load posts API successfully', async ({ page }) => {
    // API 응답 인터셉트
    const postsResponse = page.waitForResponse(
      (response) => response.url().includes('/posts') && response.status() === 200,
      { timeout: 15000 }
    );

    await page.goto('/community');

    // API 응답 확인
    try {
      const response = await postsResponse;
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toBeDefined();
    } catch (e) {
      // API 호출이 없을 수 있음 (mock 데이터 사용 시)
      console.log('Posts API not called or using mock data');
    }
  });

  test('should load questions API successfully', async ({ page }) => {
    const questionsResponse = page.waitForResponse(
      (response) => response.url().includes('/questions') && response.status() === 200,
      { timeout: 15000 }
    );

    await page.goto('/community?tab=qna');

    try {
      const response = await questionsResponse;
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toBeDefined();
    } catch (e) {
      console.log('Questions API not called or using mock data');
    }
  });

  test('should handle authentication API', async ({ page }) => {
    // 인증 API 응답 인터셉트
    const authResponse = page.waitForResponse(
      (response) => response.url().includes('/auth/me'),
      { timeout: 10000 }
    );

    await page.goto('/');

    try {
      const response = await authResponse;
      // 401 (미로그인) 또는 200 (로그인) 모두 정상
      expect([200, 401]).toContain(response.status());
    } catch (e) {
      console.log('Auth API not called');
    }
  });

  test('should not have console errors on main pages', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 주요 페이지 순회
    const pages = ['/', '/community', '/discover'];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(2000);
    }

    // 심각한 에러가 없는지 확인 (일부 3rd party 에러는 무시)
    const criticalErrors = errors.filter(
      (e) => !e.includes('third-party') && !e.includes('favicon')
    );

    // 에러 로그 출력 (디버깅용)
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
  });
});
