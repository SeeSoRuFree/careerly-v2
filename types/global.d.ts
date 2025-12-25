/**
 * React Native WebView 타입 선언
 * 앱 WebView 환경에서 postMessage 통신을 위한 전역 타입
 */
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export {};
