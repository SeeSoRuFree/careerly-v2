/**
 * E2E 테스트용 테스트 데이터
 */

export const testUser = {
  email: 'test-e2e@careerly.co.kr',
  password: 'TestPassword123!',
  name: 'E2E Test User',
};

export const newUser = {
  email: `test-${Date.now()}@careerly.co.kr`,
  password: 'NewUserPass123!',
  name: 'New Test User',
};

export const testPost = {
  id: '1',
  title: 'Test Post Title',
};
