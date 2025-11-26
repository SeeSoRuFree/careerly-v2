import { redirect } from 'next/navigation';

/**
 * 회원가입 페이지 - 로그인 페이지로 리다이렉트
 * 회원가입은 로그인 페이지에서 모달로 처리됩니다.
 */
export default function SignupPage() {
  redirect('/login');
}
