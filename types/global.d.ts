/**
 * React Native WebView 타입 선언
 * 앱 WebView 환경에서 postMessage 통신을 위한 전역 타입
 */

/** 애플 로그인 인증 데이터 */
interface AppleAuthData {
  identityToken: string;
  user: string;
  email: string;
  fullName: {
    namePrefix: string | null;
    givenName: string | null;
    familyName: string | null;
    nickname: string | null;
    middleName: string | null;
    nameSuffix: string | null;
  };
}

/** 카카오 로그인 인증 데이터 */
interface KakaoAuthData {
  accessToken: string;
}

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    /** 앱에서 애플 네이티브 로그인 완료 시 호출하는 함수 */
    handleNativeAppleAuth?: (authData: AppleAuthData) => void;
    /** 앱에서 카카오 네이티브 로그인 완료 시 호출하는 함수 */
    handleNativeKakaoAuth?: (authData: KakaoAuthData) => void;
  }
}

export { AppleAuthData, KakaoAuthData };
