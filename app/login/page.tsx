import { redirect } from 'next/navigation';

/**
 * 로그인 페이지 - 메인 페이지로 리다이렉트
 * 로그인은 모달로 처리됩니다.
 */
export default function LoginPage() {
  redirect('/');
}
