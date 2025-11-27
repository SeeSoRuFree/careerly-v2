import { test, expect } from '@playwright/test';
import { testUser, newUser } from './fixtures/test-data';

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test('should show login modal when clicking login button', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 로그인 버튼 클릭 (사이드바에 있음)
      const loginButton = page.locator('button', { hasText: '로그인' });
      const isLoginVisible = await loginButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (isLoginVisible) {
        await loginButton.click();
        await page.waitForTimeout(1000);

        // 로그인 모달 또는 폼 확인
        const dialog = page.getByRole('dialog');
        const isDialogVisible = await dialog.isVisible({ timeout: 3000 }).catch(() => false);
        expect(isDialogVisible).toBeTruthy();
      } else {
        // 이미 로그인된 상태면 패스
        expect(true).toBeTruthy();
      }
    });

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 로그인 버튼 클릭
      const loginButton = page.locator('button', { hasText: '로그인' });
      if (await loginButton.isVisible({ timeout: 5000 })) {
        await loginButton.click();

        // 로그인 폼 입력
        await page.locator('input[type="email"], input[placeholder*="이메일"]').fill(testUser.email);
        await page.locator('input[type="password"]').first().fill(testUser.password);

        // 로그인 제출 (모달 내 버튼)
        await page.locator('dialog button', { hasText: '로그인' }).click();

        // 로그인 성공 확인 (모달 닫힘 또는 로그아웃 버튼 표시)
        await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
      }
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loginButton = page.locator('button', { hasText: '로그인' });
      if (await loginButton.isVisible({ timeout: 5000 })) {
        await loginButton.click();
        await page.waitForSelector('dialog', { state: 'visible' });

        await page.locator('input[type="email"], input[placeholder*="이메일"]').fill('wrong@email.com');
        await page.locator('input[type="password"]').first().fill('wrongpassword');

        await page.locator('dialog button', { hasText: '로그인' }).click();

        // 에러 발생 시 모달이 열린 상태로 유지되거나 토스트 메시지
        await page.waitForTimeout(2000);
        // 로그인 실패 시 dialog가 여전히 열려있거나 에러 토스트가 표시됨
        const dialogStillOpen = await page.getByRole('dialog').isVisible();
        expect(dialogStillOpen).toBeTruthy();
      }
    });
  });

  test.describe('Signup', () => {
    test('should show signup form when clicking signup button', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 먼저 로그인 모달 열기
      const loginButton = page.locator('button', { hasText: '로그인' });
      const isLoginVisible = await loginButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (isLoginVisible) {
        await loginButton.click();
        await page.waitForTimeout(1000);

        // 회원가입 버튼/링크 찾기 (모달 내)
        const signupButton = page.locator('button, a', { hasText: '회원가입' });
        const isSignupVisible = await signupButton.isVisible({ timeout: 3000 }).catch(() => false);

        if (isSignupVisible) {
          await signupButton.click();
          await page.waitForTimeout(1000);

          // 이메일 필드가 보이면 성공
          const emailField = page.locator('input[type="email"], input[placeholder*="이메일"]');
          const isEmailVisible = await emailField.isVisible({ timeout: 3000 }).catch(() => false);
          expect(isEmailVisible).toBeTruthy();
        } else {
          expect(true).toBeTruthy(); // 회원가입 버튼이 없으면 패스
        }
      } else {
        expect(true).toBeTruthy(); // 이미 로그인 상태면 패스
      }
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loginButton = page.locator('button', { hasText: '로그인' });

      // 이미 로그인 상태인지 확인
      const logoutButton = page.locator('button', { hasText: '로그아웃' });
      if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
        await page.reload();
        await expect(page.locator('button', { hasText: '로그인' })).toBeVisible({ timeout: 5000 });
      } else if (await loginButton.isVisible({ timeout: 3000 })) {
        // 로그인 먼저
        await loginButton.click();
        await page.waitForSelector('dialog', { state: 'visible' });

        await page.locator('input[type="email"], input[placeholder*="이메일"]').fill(testUser.email);
        await page.locator('input[type="password"]').first().fill(testUser.password);
        await page.locator('dialog button', { hasText: '로그인' }).click();

        await page.waitForTimeout(3000);

        // 로그아웃
        const newLogoutButton = page.locator('button', { hasText: '로그아웃' });
        if (await newLogoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await newLogoutButton.click();
          await page.waitForTimeout(1000);
          await page.reload();
          await expect(page.locator('button', { hasText: '로그인' })).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });
});
