'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">개인정보 처리방침</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          (주)퍼블리(이하 &quot;회사&quot;)는 이용자의 동의를 기반으로 개인정보를 수집·이용 및 제공하고 있으며, 이용자의 권리 (개인정보자기결정권)를 적극적으로 보장합니다. 회사는 정보통신서비스제공자가 준수하여야 하는 대한민국의 관계 법령 및 개인정보보호 규정, 가이드라인을 준수하고 있습니다.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          &quot;개인정보 처리방침&quot;이란 이용자의 소중한 개인정보를 보호하여 안심하고 서비스를 이용할 수 있도록 회사가 서비스를 운영함에 있어 준수해야 할 지침을 말합니다.
        </p>

        <div className="space-y-10">
          {/* 제2조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 2조 개인정보의 수집 및 이용 목적</h2>

            <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-2">1. 이용자로부터 다음과 같은 개인정보를 수집하고 있습니다.</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              모든 이용자는 회사가 제공하는 서비스를 이용할 수 있고, 회원가입을 통해 더욱 다양한 서비스를 제공받을 수 있으며, 아래의 원칙을 준수하고 있습니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              수집한 이용자의 개인정보는 다음과 같은 목적으로만 이용하며, 목적이 변경될 경우에는 반드시 사전에 이용자에게 동의를 구하도록 하겠습니다.
            </p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-2 list-disc list-inside ml-1 mb-4">
              <li><span className="font-medium text-slate-700">필수정보란?</span> : 해당 서비스의 본질적 기능을 수행하기 위한 정보</li>
              <li><span className="font-medium text-slate-700">선택정보란?</span> : 보다 특화된 서비스를 제공하기 위해 추가 수집하는 정보 (선택 정보를 입력하지 않은 경우에도 서비스 이용 제한은 없습니다.)</li>
              <li>민감정보를 수집하지 않습니다. (인종, 사상 및 신조, 정치적 성향이나 범죄기록, 의료정보 등)</li>
            </ul>

            <h4 className="text-sm font-medium text-slate-700 mt-4 mb-2">[회원 가입 및 서비스 이용]</h4>

            <p className="text-sm font-medium text-slate-700 mt-3 mb-2">1) 회원 가입 및 정보 수정 시</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              회원 가입 방법(이메일 가입 또는 SNS 계정 연동 가입)에 따라 아래와 같은 정보를 필수 수집하며,
            </p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1 mb-3">
              <li>이메일 계정: [필수] 이름 또는 닉네임, 이메일 주소, 비밀번호</li>
              <li>카카오: [필수] 프로필 정보(닉네임/프로필 사진), 이메일, 전화번호, 카카오톡 채널 추가 상태 및 내역</li>
              <li>애플: [필수] 이름, 이메일(나의 이메일 가리기 설정 시 임의 설정된 이메일 수집)</li>
              <li>페이스북: [필수] 페이스북 계정 이메일</li>
            </ul>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              회원 가입 및 정보를 수정하는 서비스에 따라 아래의 정보를 필수 또는 선택 항목으로 수집합니다.
            </p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1 mb-3">
              <li>[필수] 관심분야, 경력사항(회사명 및 직함) 또는 학력사항(학교명 및 전공)</li>
              <li>[선택] 핸드폰 번호, 프로필 사진 및 커리어리 프로필에 직접 기재하는 정보</li>
            </ul>

            <p className="text-sm font-medium text-slate-700 mt-3 mb-2">2) 유료 서비스 이용 시</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              계좌이체 시: 은행명, 계좌 번호 등
            </p>

            <p className="text-sm font-medium text-slate-700 mt-3 mb-2">3) 서비스 이용에 따른 자동 수집 및 생성 정보</p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1 mb-3">
              <li>접속IP주소, 쿠키, 방문 일시, 지불정보 및 기록, 서비스 이용 기록, 불량 이용 기록</li>
              <li>접속 기기 정보: 단말기 모델명 및 단말식별번호, OS(Android/iOS) 및 버전, 브라우저 종류</li>
            </ul>

            <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">2. 회사는 모바일앱 서비스를 위하여 이용자의 스마트폰 내 정보 및 기능 중 아래 사항에 대해 접근할 수 있습니다.</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              회사의 모바일앱 이용을 위해서는 서비스에 따라 모바일 기기에 대한 접근 권한이 필요할 수 있으며, 이 경우 서비스 제공을 위해 모바일앱의 접근 권한을 필수 또는 선택적으로 동의를 받고 있습니다. 선택 접근항목의 경우, 거부하더라도 기본 서비스 이용에는 제한이 없습니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              앱 권한에 대한 자세한 사항(접근 항목 및 목적)은 애플리케이션 스토어를 통해 확인하실 수 있고, 단말기 내 &quot;설정&quot; 메뉴를 통하여 이용자가 직접 권한을 변경할 수 있습니다.
            </p>

            <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">3. 회사가 이용자의 개인정보를 수집하는 경우에는 반드시 사전에 이용자에게 해당 사실을 알리고 동의를 구하도록 하겠습니다.</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              수집방법에는 홈페이지(회원가입), 서비스 이용, 이벤트 응모, 고객센터, 팩스, 전화 등이 있으며, 이용자가 동의버튼을 클릭하거나 회원 정보 수정 등을 통해 추가로 수집하는 개인정보를 기재한 후 저장할 경우 개인정보 수집에 동의한 것으로 봅니다.
            </p>

            <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">4. 회사는 회원 관리, 서비스 제공 및 개선, 신규 서비스 개발 등을 위해 수집한 개인정보를 이용합니다.</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              수집한 이용자의 개인정보는 다음과 같은 목적으로만 이용하며, 목적이 변경될 경우에는 반드시 사전에 이용자에게 동의를 구하도록 하겠습니다.
            </p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1">
              <li>이용자 식별, 가입의사 확인, 불량회원의 부정한 이용 방지</li>
              <li>친구 추천, 친구에게 활동내역 알림 및 이용자 검색/등록, 이용자간 관계 형성, 이용자간 메시지 전송, 커뮤니티 활성화</li>
              <li>다양한 서비스 제공, 문의 사항 또는 불만 처리, 공지사항 전달</li>
              <li>신규 콘텐츠 및 서비스 개발, 이벤트 행사 시 정보 전달, 마케팅 및 광고 등에 활용</li>
              <li>커리어리 프로필 검색 대행 서비스를 포함한 인재 소싱 서비스 제공</li>
              <li>유료 서비스 이용 시 콘텐츠 및 서비스 제공, 요금 정산, 금융거래 본인 인증 및 금융 서비스</li>
            </ul>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 3조 개인정보의 제공 및 위탁</h2>

            <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-2">1. 회사는 원칙적으로 이용자의 사전 동의를 받아 이용자들의 개인정보를 외부에 제공합니다.</h3>

            <p className="text-sm font-medium text-slate-700 mt-3 mb-2">가. 채용 희망 기업에게 제공되는 경우</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              채용 희망 기업에 대하여 커리어리 프로필의 조회 또는 제공을 동의한 이용자에 한하여 채용 희망 기업은 이용자의 커리어리 프로필을 조회할 수 있으며, 회사는 채용 희망 기업에 대하여 이용자의 커리어리 프로필을 제공할 수 있습니다.
            </p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1 mb-3">
              <li>개인정보를 제공받는자: 채용 희망 기업</li>
              <li>개인정보를 제공받는 자의 개인정보 이용 목적: 커리어리 프로필 검색 대행 서비스를 포함한 인재 소싱 서비스 이용</li>
              <li>제공하는 개인정보의 항목: 프로필 사진, 경력사항(회사명 및 직함), 학력사항(학교명 및 전공)을 포함한 커리어리 프로필에 입력한 정보</li>
              <li>개인정보를 제공받는 자의 개인정보 보유 및 이용 기간: 인재 소싱 서비스 계약 종료 시</li>
            </ul>

            <p className="text-sm font-medium text-slate-700 mt-3 mb-2">나. 단, 아래의 경우는 예외로 합니다.</p>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-1 list-decimal list-inside ml-1 mb-4">
              <li>법령 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              <li>통계작성, 학술연구 또는 시장조사의 목적으로 특정 개인을 알아볼 수 없는 통계 자료의 형태로 가공하여 제공하는 경우</li>
              <li>개인정보보호법 제17조 제4항, 동법 시행령 제14조의2 제1항에 따라, 회원이 동의한 개인정보의 수집 및 이용 목적의 범위와 관련이 있으며, 회원이 제3자의 제공을 충분히 예측할 수 있고, 제3자 제공이 회원의 이익을 부당하게 침해하지 않으며, 제3자 제공시 기술적인 안전성을 충분히 확보한 경우</li>
            </ol>

            <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">2. 또한 회사는 원활한 서비스 제공을 위해 최소한의 개인정보를 외부 전문업체에 위탁하여 운영하고 있습니다.</h3>

            <p className="text-sm font-medium text-slate-700 mt-4 mb-2">[국내 처리 위탁]</p>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3 ml-1">
              <div>
                <p className="font-medium text-slate-700">1) 배송업체</p>
                <ul className="list-disc list-inside ml-2">
                  <li>위탁 업무: 주문 및 이벤트 상품의 보관, 배송, 배송 추적</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">2) 업체명: (주)다우기술(반값문자)</p>
                <ul className="list-disc list-inside ml-2">
                  <li>위탁 업무: SMS 문자 메시지 발송</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">3) 업체명: AWS</p>
                <ul className="list-disc list-inside ml-2">
                  <li>위탁 업무: 서비스 제공을 위한 클라우드 인프라 관리, 회원정보 및 결제 정보 보관</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-700 mt-4 mb-2">[국외 처리 위탁]</p>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3 ml-1">
              <div>
                <p className="font-medium text-slate-700">1) 업체명: AppsFlyer Ltd. (privacy@appsflyer.com)</p>
                <ul className="list-disc list-inside ml-2">
                  <li>이용 목적: 사용자 데이터 분석 및 이메일, 앱푸시 전송</li>
                  <li>이전 국가: 아일랜드, 벨기에</li>
                  <li>이전하는 개인정보 항목: 이메일, 유저 행동 데이터</li>
                  <li>이전 일시 및 방법: 커리어리 서비스 접속 시 네트워크를 통한 정보 전송</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">2) 업체명: MoEngage (privacy@moengage.com)</p>
                <ul className="list-disc list-inside ml-2">
                  <li>이용 목적: 사용자 데이터 분석 및 이메일, 앱푸시 전송</li>
                  <li>이전 국가: 미국</li>
                  <li>이전하는 개인정보 항목: 이름, 이메일, 프로필 정보(업무 경력 및 분야), 유저 행동 데이터</li>
                  <li>이전 일시 및 방법: 커리어리 서비스 접속 시 네트워크를 통한 정보 전송</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">3) 업체명: Amplitude (privacy@amplitude.com)</p>
                <ul className="list-disc list-inside ml-2">
                  <li>이용 목적: 사용자 데이터 분석</li>
                  <li>이전 국가: 미국</li>
                  <li>이전하는 개인정보 항목: 이름, 이메일, 방문 일시, 서비스 이용기록, 기기정보</li>
                  <li>이전 일시 및 방법: 커리어리 서비스 접속 시 네트워크를 통한 정보 전송</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">4) 업체명: Mailchimp (privacy@mailchimp.com)</p>
                <ul className="list-disc list-inside ml-2">
                  <li>이용 목적: 이메일 전송</li>
                  <li>이전 국가: 미국</li>
                  <li>이전하는 개인정보 항목: 이름, 이메일</li>
                  <li>이전 일시 및 방법: 퍼블리/커리어리 서비스에 회원가입 시 네트워크를 통한 정보 전송</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">5) 업체명: tally (hello@tally.so)</p>
                <ul className="list-disc list-inside ml-2">
                  <li>이용 목적: 설문조사 등 이용자 응답 수집</li>
                  <li>이전 국가: 벨기에</li>
                  <li>이전하는 개인정보 항목: 설문 내용에 따른 응답자가 제공한 개인정보</li>
                  <li>이전 일시 및 방법: 설문 응답 시 네트워크를 통한 정보 전송</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">6) 업체명: Algolia (privacy@algolia.com)</p>
                <ul className="list-disc list-inside ml-2">
                  <li>이용 목적: 커리어리 서비스 내 검색 기능에 필요한 유저 프로필 데이터 보관</li>
                  <li>이전 국가: 미국</li>
                  <li>이전하는 개인정보 항목: 이름, 프로필 사진, 프로필 정보(회사명, 직함, 업무 경력 및 분야를 비롯한 프로필에 입력한 내용)</li>
                  <li>이전 일시 및 방법: 커리어리 서비스에 프로필 입력 및 수정 시 네트워크를 통한 정보 전송</li>
                  <li>개인정보 보유 및 이용 기간: 위탁 계약 종료 시 또는 회원 탈퇴 시 까지</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mt-4">
              이용자는 회사의 개인정보보호책임자 및 담당부서를 통해 개인정보의 국외 이전을 거부할 수 있습니다. 이용자가 개인정보의 국외 이전을 거부하는 경우, 회사는 해당 이용자의 개인정보를 국외 이전 대상에서 제외합니다. 다만, 이 경우 회사의 서비스 중 개인정보 국외 이전이 필수적으로 수반되는 서비스의 이용이 제한될 수 있습니다.
            </p>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 4조 개인정보의 보유 및 이용 기간</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              회사는 이용자의 개인정보를 고지 및 동의받은 사항에 따라 수집·이용 목적이 달성되기 전 또는 이용자의 탈퇴 요청이 있기 전까지 해당 정보를 보유합니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              이용자의 개인정보를 수집 및 이용 목적, 이용 기간에만 제한적으로 이용하고 있습니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              다만, 다음의 경우에는 관계법령에 의해 보관해야 하는 정보는 법령이 정한 기간 동안, 회사 내부 방침에 따라 보관해야 하는 정보는 내부 방침에 따라 보관합니다.
            </p>

            <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-2">1. 온라인/모바일 서비스 제공을 위해 수집한 회원가입 정보</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">회원탈퇴 시 까지</p>

            <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-2">2. 법령에 의한 개인정보 보유</h3>
            <div className="text-sm text-slate-600 leading-relaxed space-y-2 ml-1">
              <div>
                <p className="font-medium text-slate-700">1) 통신비밀보호법</p>
                <ul className="list-disc list-inside ml-2">
                  <li>서비스 이용 관련 개인정보(인터넷 로그기록자료, 접속지 추적 자료) 보존 기간: 3개월</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">2) 전자상거래 등에서의 소비자보호에 관한 법률</p>
                <ul className="list-disc list-inside ml-2">
                  <li>표시/광고에 관한 기록 보존 기간: 6개월</li>
                  <li>계약 또는 청약철회 등에 관한 기록 보존 기간: 5년</li>
                  <li>대금결제 및 재화 등의 공급에 관한 기록 보존 기간: 5년</li>
                  <li>소비자의 불만 또는 분쟁처리에 관한 기록 보존 기간 : 3년</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">3) 신용정보의 이용 및 보호에 관한 법률</p>
                <ul className="list-disc list-inside ml-2">
                  <li>신용정보의 수집, 처리 및 이용 등에 관한 기록: 3년</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700">4) 부가가치세법</p>
                <ul className="list-disc list-inside ml-2">
                  <li>부가가치세의 과세표준과 세액의 신고자료 등: 5년</li>
                </ul>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-2">3. 회사 내부 방침에 의한 개인정보 보유</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              커리어리 부정 이용 방지 및 서비스 혼선 방지 목적에 따른 개인정보 보유 : 5년<br />
              보관 정보: 개인정보(이메일 주소, 핸드폰 번호 등) 및 서비스 부정 이용 기록(부정 가입, 이용약관 및 운영 정책 위반 기록, 비정상적인 이용 기록 등)
            </p>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 5조 개인정보의 파기</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              이용자의 개인정보에 대해 개인정보의 수집 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 또한, 탈퇴를 요청하거나 동의를 철회하는 경우에도 지체 없이 파기합니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              다만, 관계 법령 또는 회사 내부 방침에 의해 보관해야 하는 정보는 법령 및 개인정보 처리방침에서 정한 기간 동안 보관 후 파기합니다. 이때 별도 저장 관리되는 개인정보는 법령 및 개인정보 처리방침에서 정한 경우가 아니고서는 절대 다른 용도로 이용되지 않습니다. 전자적 파일 형태인 경우 복구 및 재생되지 않도록 기술적인 방법을 이용하여 완전하게 삭제하고, 그 밖에 기록물, 인쇄물, 서면 등의 경우 분쇄하거나 소각하여 파기합니다.
            </p>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 6조 회원 및 법정대리인의 권리와 의무</h2>

            <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-2">1. 회원 및 법정대리인의 권리 및 행사방법</h3>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside ml-1">
              <li>회원 및 법정 대리인은 언제든지 등록되어 있는 자신 또는 대리자의 개인정보 조회, 수정, 회원 탈퇴(동의 철회) 등의 권리를 아래와 같이 직접 또는 고객센터 등을 통해 행사할 수 있습니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>개인정보 조회 및 수정: 사이트 및 앱의 마이페이지 내 &apos;내 프로필&apos;</li>
                  <li>회원 탈퇴: 사이트 및 앱의 마이페이지 내 &apos;내 프로필&apos; 또는 고객센터에서 탈퇴를 요청할 수 있고, 성명, 아이디(가입 시 기재한 이메일) 등의 정보를 탈퇴 의사와 함께 고객센터로 문의 또는 careerly@careerly.co.kr로 이메일을 보내면 탈퇴하실 수 있습니다.</li>
                  <li>이 외에도 회사의 개인정보 보호책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.</li>
                </ul>
              </li>
              <li>회원이 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을 완료하기 전까지 해당 개인정보를 이용 또는 제공하지 않습니다.</li>
              <li>회사는 회원이 혹은 법정 대리인의 요청에 의해 삭제된 개인정보는 회사가 수집하는 &quot;개인정보의 보유 및 이용기간&quot;에 명시된 바에 따라 처리하고 그 외의 용도로 열람 또는 이용할 수 없도록 처리하고 있습니다.</li>
              <li>개인정보의 열람 및 처리정지 요구는 「개인정보 보호법」 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될 수 있고, 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.</li>
              <li>권리 행사는 정보 주체의 법정대리인이나 위임을 받은 자 등의 대리인을 통해 하실 수도 있습니다. 이 경우 &quot;개인정보 처리 방법에 관한 고시(제2020-7호)&quot; 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.</li>
              <li>회사는 정보주체 권리에 따른 조회, 수정, 회원 탈퇴 등의 요구 시 요구를 한 자가 본인이거나 정당한 대리인인지 확인할 수 있습니다.</li>
            </ol>

            <h3 className="text-sm font-semibold text-slate-800 mt-6 mb-2">2. 회원의 의무</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              회원는 자신의 개인정보를 보호할 의무가 있으며, 회사의 고의 또는 과실 등 귀책사유 없이 ID/비밀번호 공유, 로그인 상태에서 자리를 비우는 등 회원의 부주의로 인하여 발생하는 문제에 대해서는 회사가 책임지지 않습니다.
            </p>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside ml-1">
              <li>회원는 개인정보를 최신의 상태로 유지해야 하며, 부정확한 정보 입력으로 발생하는 문제의 책임은 이용자 자신에게 있습니다.</li>
              <li>회원의 ID/비밀번호는 원칙적으로 본인만 사용하여야 하며 제3자에게 이를 양도하거나 대여할 수 없습니다. 타인의 개인정보를 도용한 회원가입 또는 ID 등을 도용하여 구매한 경우, 회원자격 상실 및 관계 법령에 따라 처벌될 수 있습니다.</li>
              <li>회원의 회사의 서비스를 이용한 후 반드시 계정을 로그아웃하고 웹 브라우저 프로그램을 종료해야 합니다.</li>
            </ol>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 7조 개인정보 자동 수집 장치의 설치, 운영 및 그 거부에 관한 사항</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              회사는 쿠키(&quot;cookie&quot;)를 설치, 운영하고 있고 이용자는 이를 거부할 수 있습니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              쿠키란 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 이용자의 컴퓨터에 저장됩니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              회사는 개인화되고 맞춤화된 서비스를 제공하기 위해서 이용자의 정보를 저장하고 수시로 불러오는 쿠키를 사용합니다. 이용자가 웹사이트에 방문할 경우 웹 사이트 서버는 이용자의 디바이스에 저장되어 있는 쿠키의 내용을 읽어 이용자의 환경설정을 유지하고 맞춤화된 서비스를 제공하게 됩니다. 쿠키는 이용자가 웹 사이트를 방문할 때, 웹 사이트 사용을 설정한대로 접속하고 편리하게 사용할 수 있도록 돕습니다. 또한, 이용자의 웹사이트 방문 기록, 이용 형태를 통해서 최적화된 광고 등 맞춤형 정보를 제공하기 위해 활용됩니다.
            </p>

            <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-2">쿠키를 수집하지 못하게 거부하고 싶다면?</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              쿠키는 개인을 식별하는 정보를 자동적/능동적으로 수집하지 않으며, 이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수도 있습니다. 다만 쿠키 설치를 거부할 경우 웹 사용이 불편해지며 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">설정 방법의 예</p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1">
              <li>Internet Explorer의 경우 : 웹 브라우저 상단의 도구 메뉴 &gt; 인터넷 옵션 &gt; 개인정보 &gt; 설정</li>
              <li>Chrome의 경우 : 웹 브라우저 우측의 설정 메뉴 &gt; 화면 하단의 고급 설정 표시 &gt; 개인정보의 콘텐츠 설정 버튼 &gt; 쿠키</li>
            </ul>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 8조 개인정보의 관리적 보호 대책 및 개인정보 보호 책임자 안내</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              회사는 이용자의 개인정보를 가장 소중한 가치로 여기고 개인정보를 처리함에 있어서 다음과 같은 노력을 다하고 있습니다.
            </p>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside ml-1 mb-4">
              <li>회사는 이용자들의 개인정보를 처리함에 있어 개인정보가 분실, 도난, 유출, 변조 또는 훼손되지 않도록 안전성 확보를 위하여 『정보통신망법』, 『개인정보보호법』 등 정보통신서비스 제공자가 준수하여야 할 관련 법령에 따라 기술적·관리적 보호대책을 강구하고 있습니다.</li>
              <li>회사는 이용자의 개인정보를 보호하고 궁금증 해결, 불만 처리를 위해 다음과 같이 책임자를 지정하고 운영하고 있습니다. 개인정보 보호책임자 및 고객센터로 언제라도 문의 주시면 신속하고 충분한 답변을 드리도록 하겠습니다.</li>
            </ol>

            <div className="text-sm text-slate-600 space-y-1 ml-1 mb-4">
              <p><span className="font-medium text-slate-700">책임자:</span> 박병규</p>
              <p><span className="font-medium text-slate-700">전화:</span> 070-4641-6880</p>
              <p><span className="font-medium text-slate-700">문의:</span> careerly@careerly.co.kr</p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              또한 개인정보가 침해되어 이에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하셔서 도움을 받으실 수 있습니다.
            </p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1">
              <li>개인정보분쟁조정위원회: 국번없이 1833-6972 / www.kopico.go.kr</li>
              <li>개인정보침해신고센터: 국번없이 118 / privacy.kisa.or.kr</li>
              <li>대검찰청: 국번없이 1301 / www.spo.go.kr</li>
              <li>경찰청: 국번없이 182 / ecrm.cyber.go.kr</li>
            </ul>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 9조 본 개인정보 처리방침의 적용 범위</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              본 개인정보처리방침은 회사의 브랜드인 &apos;커리어리(careerly.co.kr)&apos; 및 관련 제반 서비스(모바일 웹/앱 포함)에 적용되며, 다른 브랜드로 제공되는 서비스에 대해서는 별개의 개인정보처리방침이 적용될 수 있습니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              회사는 회원에게 다른 회사의 웹사이트 또는 자료에 대한 링크를 제공할 수 있습니다. 이 경우 회사는 외부사이트 및 자료에 대한 아무런 통제권이 없으므로 그로부터 제공받는 서비스나 자료의 유용성에 대해 책임질 수 없으며 보증할 수 없습니다.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              회사가 포함하고 있는 링크를 클릭하여 타 사이트의 페이지로 옮겨 갈 경우, 본 개인정보 처리방침이 적용되지 않으므로, 새로 방문한 사이트의 정책을 검토해 보시기 바랍니다.
            </p>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제 10조 개인정보 처리방침의 개정 전 고지 의무</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              회사는 위 내용에 대한 추가, 삭제 및 수정이 있을 경우에는 시행일 7일 전부터 웹사이트 또는 앱 내에 공지하여 이용자에게 설명 드리겠습니다. 단, 이용자의 소중한 권리 또는 의무에 중요한 내용 변경은 최소 30일전에 말씀 드리도록 하겠습니다.
            </p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1">
              <li>개인정보 처리방침 변경 공고일자 : 2024년 7월 1일</li>
              <li>변경 개인정보 처리방침 시행일자 : 2024년 7월 1일</li>
            </ul>
          </section>
        </div>

        {/* Footer spacing */}
        <div className="h-16" />
      </main>
    </div>
  );
}
