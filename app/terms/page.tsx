'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
          <h1 className="text-lg font-semibold text-slate-900">이용약관</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-10">
          {/* 제1조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제1조 목적</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              이 약관은 ㈜퍼블리 (이하 &apos;회사&apos;)가 운영하는 인터넷 관련 서비스(이하 &apos;서비스&apos;)를 하나의 회원 아이디와 비밀번호로 동시에 각 사이트에 가입하여 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제2조 용어의 정의</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              이 약관에서 사용하는 용어의 정의는 다음과 같습니다. 본 약관에 명시되지 않은 용어는 관련 법령이 정하는 바에 따르며, 그 외에는 일반적인 상거래관행에 의합니다.
            </p>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li><span className="font-medium text-slate-700">회사:</span> ㈜퍼블리를 말합니다.</li>
              <li><span className="font-medium text-slate-700">사이트:</span> 회사가 서비스를 제공하기 위해 운영하는 사이트로 &apos;careerly.co.kr&apos;를 말합니다.</li>
              <li><span className="font-medium text-slate-700">앱:</span> 스마트폰, 태블릿 등 휴대용 단말기에 설치되어 회사가 제공하는 서비스를 구현하는 애플리케이션을 말합니다.</li>
              <li><span className="font-medium text-slate-700">이용자:</span> 사이트 및 앱에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li><span className="font-medium text-slate-700">회원:</span> 회사에 개인정보를 제공하여 회원등록을 한 자로서 이 약관에 따라 회사와 서비스이용계약을 체결한 자를 말합니다.</li>
              <li><span className="font-medium text-slate-700">ID:</span> 회원의 식별과 서비스 이용을 위하여 회원이 선정하고 회사가 승인한 이메일을 말합니다.</li>
              <li><span className="font-medium text-slate-700">비밀번호:</span> 회원의 동일성 확인과 회원의 권익 및 비밀보호를 위하여 회원 스스로가 설정하여 회사에 등록한 영문 또는 숫자의 조합을 말합니다.</li>
              <li><span className="font-medium text-slate-700">콘텐츠:</span> 회사가 제공하는 디지털 콘텐츠 및 기타 관련 정보(부호, 문자, 음성, 음향, 이미지, 영상 등으로 표현된 자료 또는 정보)를 말합니다.</li>
              <li><span className="font-medium text-slate-700">모임(온라인, 오프라인 행사):</span> 특정한 목적 아래 여러 사람이 온라인 또는 오프라인 상에서 모이는 행사를 말합니다.</li>
              <li><span className="font-medium text-slate-700">통신판매중개서비스:</span> 회사가 제공하는 통신판매중개서비스 및 이에 수반되는 부가서비스 일체를 말합니다.</li>
              <li><span className="font-medium text-slate-700">통신판매중개의뢰자:</span> 회사가 제공하는 통신판매중개서비스를 통하여 이용자에게 재화 또는 용역(이하 &quot;재화 등&quot;이라 한다)를 판매할 목적으로 광고 등을 제공하는 자로서 회사와 별도 통신판매중개서비스 이용 계약을 체결한 자를 말합니다.</li>
            </ol>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제3조 약관의 명시와 개정</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 이 약관의 내용과 상호, 영업소 소재지, 대표자의 성명, 사업자 등록번호 등을 이용자가 알 수 있도록 사이트의 초기 서비스 화면에 게시합니다. 다만, 약관의 구체적 내용은 이용자가 연결화면을 통하여 볼 수 있도록 합니다.</li>
              <li>회사는 약관의 규제에 관한 법률, 콘텐츠산업 진흥법, 전자문서 및 전자거래 기본법, 전자서명법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 전자상거래 등에서의 소비자보호에 관한 법률, 유사수신행위의 규제에 관한 법률 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
              <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 웹사이트 또는 앱 내에 최소 그 개정약관 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 이용자에게 불리하게 약관의 내용을 변경하는 경우에는 적용일자 30일 이전부터 공지합니다.</li>
              <li>제3항에 따라 공지된 적용일자 이후에 회원이 회사의 서비스를 계속 이용하는 경우에는 개정된 약관에 동의하는 것으로 봅니다. 개정된 약관에 동의하지 아니하는 회원은 언제든지 자유롭게 서비스 이용계약을 해지할 수 있습니다. 유료서비스를 이용하는 회원이 약관의 개정에 동의하지 아니하여 해지할 경우 회사가 정한 환불정책에 따릅니다.</li>
              <li>이 약관에서 정하지 아니한 사항과 이 약관의 해석에 관하여는 정부가 제정한 전자거래소비자보호지침 및 관계법령 또는 일반 상 관례에 따릅니다.</li>
            </ol>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제4조 이용계약의 성립</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>이용계약은 이용자의 약관동의와 이용신청에 대한 회사의 승낙으로 성립합니다.</li>
              <li>이용계약의 성립시기는 회사가 가입완료 표시를 신청절차 상에 표시한 시점으로 합니다.</li>
            </ol>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제5조 이용신청 및 제한</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 정확히 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
              <li>회사는 다음 각호에 해당하는 경우에 대해서는 그 신청에 대한 제한 사유가 해소될 때까지 신청 승낙 및 이용 계약 성립을 유보 또는 일부 서비스 이용을 제한할 수 있습니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>신청 내용이 허위인 것으로 판명 되거나, 그러하다고 의심할 만한 합리적인 사유가 발생할 경우</li>
                  <li>서비스 관련 제반 용량이 부족한 경우</li>
                  <li>기술상 장애 사유가 있는 경우</li>
                  <li>기타 회사가 필요하다고 인정하는 경우</li>
                </ul>
              </li>
              <li>회사는 다음에 해당하는 경우에는 이용신청을 승낙을 거절하거나, 사후에 이용계약을 해지할 수 있습니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>이미 가입된 회원과 이메일 주소가 동일한 경우</li>
                  <li>회사로부터 서비스 이용 제한 등의 조치를 당했거나, 이 약관에 의해 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>다른 사람의 명의를 사용하여 신청하였을 경우</li>
                  <li>회원가입 신청서의 내용을 허위로 기재하였을 경우</li>
                  <li>만 14세 이상이 아닌 경우</li>
                  <li>사회의 안녕, 질서 혹은 미풍양속을 저해할 목적으로 신청하였을 경우</li>
                  <li>기타 회사가 정한 이용신청 요건이 미비 되었을 경우</li>
                </ul>
              </li>
              <li>회사가 서비스를 제공하기 위해 운영하는 모든 사이트를 하나의 ID 및 비밀번호로 이용할 수 있으며, 모든 사이트에서 회원가입이 가능하며, 회원가입 시 부여 받은 ID로 접속하여 이용할 수 있습니다.</li>
            </ol>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제6조 이용자 ID부여 및 변경</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>이용자 ID는 이용자가 가지고 있는 이메일 주소이며 메일 주소가 바뀌었을 경우, 사이트 및 앱에서 변경하거나 고객센터에 문의 혹은 careerly@careerly.co.kr로 이메일을 보내서 변경할 수 있습니다.</li>
              <li>서비스 이용자 ID 및 비밀번호의 관리책임은 회원에게 있습니다. 이를 소홀히 관리하여 발생하는 서비스 이용상의 손해 또는 제3자에 의한 부정이용 등에 대한 책임은 회원에게 있으며 회사는 그에 대한 책임을 일절 지지 않습니다.</li>
            </ol>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제7조 계약사항의 변경</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원은 회원정보관리를 통해 언제든지 자신의 정보를 열람하고, 수정할 수 있습니다.</li>
              <li>회원은 이용 신청 시 기재한 사항에 변경이 있는 경우, 온라인으로 개인정보를 수정하거나 전자우편, 기타방법으로 회사에 대하여 그 변경사항을 알려야 합니다. 이를 알리지 않아 발생하는 불이익에 대한 책임은 회원에게 있습니다.</li>
            </ol>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제8조 이용자의 정보 보안</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사 서비스 가입절차를 완료하는 순간부터 회원은 입력한 정보의 비밀을 유지할 책임이 있으며 ID와 비밀번호를 사용하여 발생하는 모든 결과에 대한 책임도 회원에게 있습니다.</li>
              <li>ID와 비밀번호에 관한 모든 관리의 책임은 회원에게 있으며, ID 나 비밀번호가 부정하게 사용되었다는 사실을 발견한 경우에는 즉시 회사에 통지하여야 합니다. 통지하지 않음으로 인해 발생하는 모든 책임은 회원에게 있습니다.</li>
              <li>이용자는 회사 서비스의 사용 종료 시마다 정확히 로그아웃(Log-out)해야 하며, 로그아웃 하지 아니하여 제3자가 회원에 관한 정보를 도용하는 등의 결과로 인해 발생하는 손해 및 손실에 대하여 회사는 책임을 부담하지 아니합니다.</li>
            </ol>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제9조 서비스 이용</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 회원에게 아래와 같은 서비스를 제공합니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>콘텐츠 추천 및 알림 서비스</li>
                  <li>모임(온라인, 오프라인 행사) 서비스</li>
                  <li>통신판매중개의뢰자의 재화 등에 대한 광고 제공 서비스(통신판매중개서비스 포함)</li>
                  <li>기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
                </ul>
              </li>
              <li>회사가 회원의 이용신청을 승낙한 때부터 회원은 서비스를 이용할 수 있습니다. 단 일부 서비스의 경우에는 지정된 일자 내지 일정 요건 충족시에 서비스를 이용할 수 있습니다.</li>
              <li>회사의 업무상 또는 기술상의 장애로 인하여 서비스의 이용을 개시하지 못하는 경우에는 사이트에 공시하거나 회원에게 이를 통지합니다.</li>
              <li>서비스의 이용은 연중무휴, 1일 24시간을 원칙으로 합니다. 다만, 회사의 업무상 또는 기술상의 이유로 서비스가 일시 중지 될 수 있습니다. 이러한 경우 회사는 사전 또는 사후에 이를 공지합니다.</li>
              <li>회원 가입한 후라도 일부 서비스 이용 시 서비스 제공자의 요구에 따라 특정회원에게만 서비스를 제공할 수 있습니다.</li>
              <li>회사는 서비스를 일정범위로 분할하여 각 범위 별로 이용가능 시간을 별도로 정할 수 있습니다. 이 경우 그 내용을 사전에 공개합니다.</li>
              <li>회사는 회원 별 서비스 이용 가능 기기의 종류, 기기 대 수 등을 변경할 수 있습니다.</li>
            </ol>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제10조 서비스의 중지 및 중지에 대한 공지</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>이용자는 회사 서비스에 보관되거나 전송된 메시지 및 기타 통신 메시지 등의 내용이 국가의 비상사태, 정전, 회사 관리범위 외의 서비스 설비 장애 및 기타 불가항력에 의하여 보관되지 못하였거나 삭제된 경우, 전송되지 못한 경우 및 기타 통신 데이터의 손실에 대해 회사는 관련 책임을 부담하지 않습니다.</li>
              <li>회사가 정상적인 서비스 제공의 어려움으로 인하여 일시적으로 서비스를 중지하여야 할 경우에는 서비스 중지 1주일 전에 고지 후 서비스를 중지할 수 있으며, 회사는 본 약관에서 정한 방법으로 회원에게 고지하고 회사에서 수립한 정책에 따라 회원에게 보상하거나 환불할 수 있습니다.</li>
              <li>회사의 사정으로 서비스를 영구적으로 중단하여야 할 경우에 제2항을 준용합니다. 다만 이 경우 사전 고지기간은 1개월로 합니다.</li>
              <li>천재지변, 국가비상사태 등 회사가 정상적인 서비스 제공이 불가능할 경우 일시적으로 서비스를 제한, 정지시킬 수 있으며 사전 또는 사후 회원에게 중지사유 및 기간을 공지합니다.</li>
              <li>회사는 사전 공지 후 서비스를 일시적으로 수정, 변경 및 중단할 수 있으며, 상당한 이유가 있을 경우 위 사전 공지는 생략될 수 있습니다.</li>
              <li>회사는 긴급한 시스템 점검, 증설 및 교체 등 부득이한 사유로 인하여 예고 없이 일시적으로 서비스를 중단할 수 있으며, 새로운 서비스로의 교체 등 회사가 적절하다고 판단하는 사유에 의하여 현재 제공되는 서비스를 완전히 중단할 수 있습니다.</li>
              <li>회사가 통제할 수 없는 사유로 인한 서비스 중단의 경우(시스템관리자의 고의, 과실 없는 디스크 장애, 시스템다운 등)에 사전통지가 불가능하며 타인(PC통신회사, 기간통신사업자 등)의 고의, 과실로 인한 시스템 중단 등의 경우에는 통지하지 않습니다.</li>
              <li>이용자가 장기간 휴면 회원인 경우, 회사는 안내 메일 또는 공지사항 발표 후 1주일간의 통지기간을 거쳐 서비스 사용을 중지시킬 수 있습니다.</li>
              <li>회사와 계약한 저작권자 또는 출판사 등과의 계약 종료 및 변경 등의 사유로 서비스의 내용이 변경되거나, 서비스가 중단될 수 있습니다.</li>
              <li>회사가 제공하는 서비스의 형태와 기능, 디자인 등 필요한 경우 수시로 변경되거나, 중단될 수 있습니다. 회사는 이 경우 개별적인 변경에 대해서 회원에게 사전 통지하지 않습니다. 다만, 회원에게 불리한 것으로 판단되는 경우 이메일을 통하여 이를 공지합니다.</li>
            </ol>
          </section>

          {/* 제11조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제11조 서비스 이용제한</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>이용자가 제공하는 정보의 내용이 허위인 것으로 판명되거나, 허위가 있다고 의심할 만한 합리적인 사유가 발생할 경우 회사는 이용자의 본 서비스 사용을 일부 또는 전부 이용 정지할 수 있으며, 이로 인해 발생하는 불이익에 대해 회사는 책임을 부담하지 아니합니다.</li>
              <li>회사는 이용자가 본 약관 제18조 이용자의 의무 등 본 약관의 내용에 위배되는 행동을 한 경우, 임의로 서비스 사용을 제한 및 중지할 수 있습니다. 이 경우 회사는 이용자의 접속을 금지할 수 있습니다.</li>
            </ol>
          </section>

          {/* 제12조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제12조 정보제공 및 광고의 게재</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 회원이 서비스 이용 중 필요하다고 인정되는 다양한 정보 및 광고에 대해서는 전자우편이나 서신우편, SMS(휴대폰 문자메시지), DM(Direct Mail), 메신저 등의 방법으로 회원에게 제공할 수 있으며, 만약 원치 않는 정보를 수신한 경우 회원은 이를 수신거부 할 수 있습니다.</li>
              <li>회사는 서비스의 운용과 관련하여 서비스화면, 홈페이지, 전자우편 등에 광고 등을 게재할 수 있으며, 회사는 서비스를 이용하고자 하는 회원이 이 광고게재에 대하여 동의하는 것으로 간주합니다.</li>
              <li>회사는 서비스 상에 게재되어 있거나 서비스를 통한 광고주와의 판촉활동에 회원이 참여하거나 교신 또는 거래의 결과로서 발생하는 모든 손실 또는 손해에 대해 책임을 지지 않습니다.</li>
            </ol>
          </section>

          {/* 제13조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제13조 게시물의 관리 운영</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원이 작성한 게시물에 대한 모든 권리 및 책임은 이를 게시한 회원에게 있으며, 회사는 회원이 게시하거나 등록하는 서비스의 내용물이 다음 각 항에 해당한다고 판단되는 경우에 사전통지 없이 삭제할 수 있고, 이에 대하여 회사는 어떠한 책임도 지지 않습니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>본 서비스 약관에 위배되거나 상용 또는 불법, 음란, 저속하다고 판단되는 게시물, 청소년유해게시물을 게시한 경우</li>
                  <li>회사의 원활한 서비스 제공을 방해하거나 서비스 성격에 부합하지 않는 정보의 경우</li>
                  <li>공공질서 및 미풍양속에 위반되는 내용인 경우</li>
                  <li>다른 회원 또는 제3자를 비방하거나 중상모략으로 명예를 손상시키고 피해를 주는 내용인 경우</li>
                  <li>다른 회원 또는 제3자의 개인정보가 포함되거나, 사생활을 침해하는 경우</li>
                  <li>다른 회원 또는 제3자의 저작권, 지적 재산권, 초상권 등 권리를 침해하는 내용인 경우</li>
                  <li>동일한 내용을 동일 개별 서비스 또는 여러 개별 서비스에 반복적으로 등록하는 경우</li>
                  <li>성별, 종교, 장애, 연령, 사회적 신분, 인종, 지역, 직업 등을 차별하거나 이에 대한 편견을 조장하는 내용을 작성하는 경우</li>
                  <li>해당 상품 및 콘텐츠 내용과 관련 없는 경우</li>
                  <li>광고, 홍보 등의 상업적인 내용인 경우</li>
                  <li>범죄적 행위에 결부된다고 인정되는 내용인 경우</li>
                  <li>기타 관계 법령에 위배되는 경우</li>
                </ul>
              </li>
              <li>회사는 게시된 내용이 일정기간 이상 경과되어, 게시물로써의 효력을 상실하여 그 존치 목적이 불분명한 경우 공지사항 발표 후 1주일간의 통지기간을 거쳐 해당 게시물을 삭제할 수 있습니다.</li>
              <li>회원의 게시물이 타인의 저작권을 침해함으로써 발생하는 민, 형사상의 책임은 전적으로 회원이 부담하여야 합니다.</li>
              <li>회원의 게시물이 정보통신망 이용촉진 및 정보보호에 관한 법률 또는 저작권법 등 관련 법령에 위반되는 내용을 포함하는 경우, 해당 게시물의 권리자는 관련 법령이 정한 절차에 따라 해당 게시물의 게시중단(임시 조치) 등을 요청할 수 있습니다.</li>
            </ol>
          </section>

          {/* 제14조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제14조 권리의 귀속 및 저작물의 이용</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사가 회원에게 제공하는 서비스에 대한 지식재산권을 포함한 일체의 권리는 회사에 귀속됩니다.</li>
              <li>회원이 서비스를 이용하는 과정에서 작성한 게시물, 댓글, 태그 등(이하 &quot;게시물 등&quot;이라 합니다)에 대한 저작권을 포함한 일체의 권리는 별도의 의사표시가 없는 한 각 회원에게 귀속됩니다.</li>
              <li>회원은 자신이 서비스에 게시한 게시물 등을 회사가 국내·외에서 다음 각 호의 목적으로 사용하는 것을 허락합니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>서비스(제3자가 운영하는 사이트 또는 미디어의 일정 영역 내에 입점하는 형태로 제공되는 경우 포함) 내에서 게시물 등의 복제·전송·전시 및 우수 게시물을 서비스 화면에 노출하기 위하여 게시물의 내용 변경 없이 크기를 변환하거나 단순화하는 등의 방식으로 수정하는 것</li>
                  <li>회사가 운영하는 다른 서비스에서 게시물을 복제·전송 또는 전시하는 것. 다만, 회원이 명시적으로 복제·전송 또는 전시에 동의하지 아니한 경우에는 그러하지 않음</li>
                  <li>회사의 서비스를 홍보하기 위한 목적으로 미디어·통신사 등에 게시물의 전부 또는 일부를 보도·방영하게 하는 것. 이 경우 회사는 회원의 개별 동의 없이 미디어·통신사 등에게 회원정보를 제공하지 않음</li>
                </ul>
              </li>
              <li>회사는 전항 이외의 방법으로 회원의 게시물 등을 이용하고자 하는 경우에는 사전에 회원의 동의를 얻습니다.</li>
              <li>회원이 서비스에 게시물을 게재하는 것은 다른 회원이 게시물을 서비스 내에서 사용하거나 회사가 검색결과로 사용하는 것을 허락한 것으로 봅니다.</li>
              <li>회사는 서비스의 정책 또는 회사가 운영하는 서비스 간 통합 등의 사유로 게시물의 게재위치를 변경·이전할 수 있으며, 이 경우 사전에 공지합니다.</li>
            </ol>
          </section>

          {/* 제15조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제15조 게시물의 관리 및 임시조치</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원의 게시물 등이 관련 법령에 위반되는 내용을 포함하는 경우, 회사는 해당 관련 법령이나 적법한 권리자의 요청에 따라 해당 게시물 등에 대한 게시중단 및 삭제 등의 조치를 취할 수 있습니다.</li>
              <li>회사는 게시물 등에 회사의 서비스 운영정책에 위반되는 사유가 있는 것으로 확인된 경우, 운영정책에 따라 해당 게시물에 대해 조치를 취할 수 있습니다.</li>
              <li>정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 &quot;정보통신망법&quot;)의 규정에 의해 다른 회원의 공개된 게시물 등이 본인의 사생활을 침해하거나 명예를 훼손하는 등 권리를 침해 받은 회원 또는 제3자(이하 &quot;삭제 등 신청인&quot;)는 그 침해사실을 소명하여 회사에 해당 게시물 등의 삭제 또는 반박 내용의 게재를 요청할 수 있습니다.</li>
              <li>전항에 의해 본인의 게시물 등이 임시조치된 회원(이하 &quot;게시자&quot;)은 임시조치기간 중 회사에 해당 게시물 등을 복원해 줄 것을 요청(이하 &quot;재게시 청구&quot;)할 수 있습니다.</li>
              <li>회사는 서비스 내에 게시된 게시물 등이 사생활 침해 또는 명예훼손 등 제3자의 권리를 침해한다고 인정하는 경우 회원 또는 제3자의 신고가 없는 경우에도 임시조치(이하 &quot;임의의 임시조치&quot;)를 취할 수 있습니다.</li>
              <li>회원의 게시물 등으로 인한 법률상 이익 침해를 근거로, 다른 회원 또는 제3자가 회원 또는 회사를 대상으로 하여 민·형사상의 법적조치를 취하는 경우, 회사는 동법적조치의 결과인 법원의 확정판결이 있을 때까지 관련게시물 등에 대한 접근을 잠정적으로 제한할 수 있습니다.</li>
            </ol>
          </section>

          {/* 제16조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제16조 회사의 소유권</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사가 제공하는 서비스, 그에 필요한 소프트웨어, 이미지, 마크, 로고, 디자인, 서비스 명칭, 정보 및 상표 등과 관련된 지적재산권 및 기타 권리는 회사에게 있습니다.</li>
              <li>회원은 회사가 명시적으로 승인한 경우를 제외하고는 제1항 소정의 각 재산에 대한 전부 또는 일부의 수정, 대여, 대출, 판매, 배포, 제작, 양도, 재라이센스, 담보권설정행위, 상업적 이용행위를 할 수 없으며, 제3자로 하여금 이와 같은 행위를 하도록 허락할 수 없습니다.</li>
            </ol>
          </section>

          {/* 제17조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제17조 회사의 의무</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 지속적 안정적으로 서비스를 제공하기 위하여 노력할 의무가 있습니다.</li>
              <li>회사는 이용자의 개인 신상 정보를 본인의 승낙 없이 제3자에게 누설, 배포하지 않습니다. 다만, 관계법령에 의해 국가기관의 요구나 전기통신관련법령 및 정보통신윤리위원회의 요청 등 법률의 규정에 따른 적법한 절차에 의한 경우에는 그러하지 아니합니다.</li>
              <li>회사는 계속적이고 안정적인 서비스의 제공을 위하여 설비에 장애가 생기거나 멸실된 때에는 부득이한 사유가 없는 한 지체없이 이를 수리 또는 복구합니다.</li>
              <li>회사가 제공하는 서비스로 인하여 회원에게 손해가 발생한 경우 그러한 손해가 회사의 고의나 중과실에 기해 발생한 경우에 한하여 책임을 부담하며, 그 책임의 범위는 통상손해에 한합니다.</li>
              <li>회사는 회원으로부터 제기되는 의견이나 불만이 정당하다고 인정할 경우에는 신속히 처리하여야 합니다. 다만, 신속한 처리가 곤란한 경우에는 회원에게 그 사유와 처리일정을 통보하여야 합니다.</li>
              <li>회사는 관련법령이 정하는 바에 따라서 회원 등록정보를 포함한 회원의 개인정보를 보호하기 위하여 노력합니다.</li>
            </ol>
          </section>

          {/* 제18조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제18조 이용자의 의무</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원은 서비스 이용을 위해 가입할 경우 현재의 사실과 일치하는 완전한 정보(이하 &quot;가입정보&quot;)를 제공해야 하며, 가입정보가 변경된 경우 즉시 갱신해야 합니다.</li>
              <li>회원은 본인의 아이디와 비밀번호 관리를 위해 제8조 이용자의 정보보안 사항을 준수하여야 합니다.</li>
              <li>회원은 서비스를 이용 시, 각 호에 해당하는 행위를 해서는 안됩니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>타인(소수를 포함)에게 위해를 가하는 행위</li>
                  <li>타인의 아이디(ID), 비밀번호(PASSWORD) 도용 및 타인으로 가장하는 행위</li>
                  <li>타인과의 관계를 허위로 명시하는 행위</li>
                  <li>타인을 비방할 목적으로 사실 또는 허위의 사실을 적시하여 명예를 훼손하는 행위</li>
                  <li>자기 또는 타인에게 재산상의 이익을 주거나 타인에게 손해를 가할 목적으로 허위의 정보를 유통시키는 행위</li>
                  <li>수치심이나 혐오감 또는 공포심을 일으키는 말이나 음향, 글을 타인에게 전달하는 행위</li>
                  <li>회사의 사전 승낙 없이 서비스를 통하여 얻은 정보를 가공, 판매하는 행위 등 서비스를 이용한 영리행위</li>
                  <li>타인의 정보통신서비스 이용명의를 도용하여 사용하는 행위</li>
                  <li>불필요하거나 승인되지 않은 광고, 판촉물을 게재하거나, 저속 또는 음란한 데이터, 텍스트, 소프트웨어, 음악, 사진, 그래픽, 비디오 메시지 등을 게재하거나 메시지 또는 전자우편으로 보내는 행위</li>
                  <li>권리(지적재산권을 포함한 모든 권리)가 없는 콘텐츠를 게재하거나 메시지 또는 전자우편으로 보내는 행위</li>
                  <li>컴퓨터 소프트웨어, 하드웨어, 전기통신 장비를 파괴, 방해 또는 기능을 제한하기 위한 소프트웨어 바이러스를 게재하거나 메시지 또는 전자우편으로 보내는 행위</li>
                  <li>다른 컴퓨터 코드, 파일, 프로그램을 포함하고 있는 자료를 게시, 게재, 전자우편으로 보내는 행위 등 다른 사용자의 개인정보를 수집 또는 저장하는 행위</li>
                  <li>재물을 걸고 도박하거나 사행행위를 하는 행위</li>
                  <li>윤락행위를 알선하거나 음행을 매개하는 내용의 정보를 유통시키는 행위</li>
                  <li>기타 불법적이거나 부당한 행위</li>
                </ul>
              </li>
              <li>회원은 이 약관 및 관계법령에서 규정한 사항을 준수하여야 합니다.</li>
            </ol>
          </section>

          {/* 제19조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제19조 부정이용 금지</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              회사는 다음 각호에 해당하는 경우를 부정 이용행위로 봅니다.
            </p>
            <ul className="text-sm text-slate-600 leading-relaxed space-y-1 list-disc list-inside ml-1">
              <li>자신의 ID 및 콘텐츠, 포인트, 쿠폰 등 회사가 제공하는 서비스를 타인에게 판매, 대여, 양도하는 행위 및 이를 광고하는 행위</li>
              <li>동일한 ID로 회사가 정한 기기 대 수 이상의 기기(PC, 스마트폰, 태블릿PC 등)에 등록, 동시 접속하여 서비스를 이용하는 경우</li>
              <li>서비스 이용 중, 복제프로그램을 실행하거나 화면을 캡쳐, 또는 녹화, 스크래핑, 크롤링 등의 행위를 하는 경우</li>
              <li>콘텐츠의 DRM(Digital Rights Management)을 무력화하는 일체의 행위</li>
              <li>결제를 통한 회사와 회원 간의 정당한 계약이 성립되지 아니한 상태에서 콘텐츠를 불법으로 사용하려는 일체의 행위</li>
              <li>포인트 등을 부당하게 확보할 목적으로 서비스를 이용하는 행위</li>
            </ul>
          </section>

          {/* 제20조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제20조 개인정보보호정책</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 관계 법령이 정하는 바에 따라 계정 정보를 포함한 회원의 개인정보를 보호하기 위해 노력합니다. 회원의 개인정보에 대한 수집, 이용, 제공, 위탁 등의 구체적인 내용은 회사가 별도로 고지하는 개인정보처리방침에 따릅니다.</li>
              <li>회사는 이용 신청 시 회원이 제공하는 정보를 통하여 회원에 관한 정보를 수집하며, 회원의 개인정보는 본 이용계약의 이행과 본 이용계약상의 서비스제공을 위한 목적으로 이용합니다.</li>
              <li>회사는 서비스 제공과 관련하여 취득한 회원의 정보를 본인의 승낙 없이 제3자에게 누설 또는 배포할 수 없으며 상업적 목적으로 사용할 수 없습니다. 다만, 다음의 각 호의 경우에는 그러하지 아니합니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>관계 법령에 의하여 수사상의 목적으로 관계기관으로부터 요구가 있는 경우</li>
                  <li>통계작성, 학술연구 또는 시장조사의 목적으로 특정 개인을 알아볼 수 없는 통계 자료의 형태로 가공하여 제공하는 경우</li>
                  <li>기타 관계법령에서 정한 절차에 따른 요청이 있는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* 제21조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제21조 회원에 대한 통지</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사가 회원에 대한 통지를 하는 경우, 회원이 회사와 미리 약정하여 지정한 전자우편 주소, 팝업, 웹/앱 푸시알림, 전화로 할 수 있습니다.</li>
              <li>회사는 불특정 다수 회원에 대한 통지의 경우, 1주일 이상 사이트에 게시함으로써 개별 통지에 갈음할 수 있습니다. 다만, 회원 본인의 거래와 관련하여 중대한 영향을 미치는 사항에 대하여는 개별 통지합니다.</li>
            </ol>
          </section>

          {/* 제22조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제22조 개별 서비스에 대한 약관 및 이용조건</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              회사는 제공하는 서비스의 구체적 내용에 따라 개별 서비스에 대한 약관 및 이용조건을 각 개별서비스마다 별도로 정하여 회원의 동의를 얻을 수 있습니다. 이 경우 개별 서비스에 대한 이용약관 등이 본 약관에 우선합니다.
            </p>
          </section>

          {/* 제23조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제23조 주문 및 결제</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원은 회사가 제공하는 다음 각호 또는 이와 유사한 절차에 의하여 콘텐츠 및 재화의 구매를 신청을 합니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>콘텐츠 및 재화의 검색, 목록 열람 및 구매 대상 선택</li>
                  <li>콘텐츠 및 재화의 상세정보 확인</li>
                  <li>회원의 성명, 이메일 주소, 전화번호(또는 이동전화번호), 주소 등의 입력 및 결제하기 클릭</li>
                  <li>결제금액 확인, 결제수단 선택 및 결제하기</li>
                  <li>결제금액 재확인 및 결제</li>
                </ul>
              </li>
              <li>회원은 회사에서 정하는 방법으로 유료서비스의 결제가 가능합니다. 단, 미성년 회원의 결제는 원칙적으로 보호자(법정대리인)의 명의 또는 동의 하에 이루어져야 하고, 보호자(법정대리인)는 본인 동의 없이 체결된 자녀(미성년자)의 계약을 취소할 수 있습니다.</li>
            </ol>
          </section>

          {/* 제24조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제24조 계약의 성립 및 통지</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 다음 각호에 해당하지 않는 한 구매 신청을 승낙합니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>신청 내용에 허위, 누락, 오기가 있는 경우</li>
                  <li>미성년자가 청소년 보호법에서 금지하는 콘텐츠를 구매하는 경우</li>
                  <li>유료 서비스 신청금액 총액과 입금총액이 일치하지 않은 경우</li>
                  <li>구매신청에 승낙하는 것이 회사의 기술상 현저히 지장이 있다고 판단하는 경우</li>
                  <li>기타 합리적인 이유가 있는 경우로서 회사가 필요하다고 인정되는 경우</li>
                </ul>
              </li>
              <li>회사는 회원이 본 약관 제23조의 절차에 따라 유료서비스 이용을 신청할 경우, 승낙의 의사표시로써 본 약관 제21조의 방법을 통하여 회원에게 통지하고, 승낙의 통지가 회원에게 도달한 시점에 계약이 성립한 것으로 봅니다.</li>
              <li>회사의 승낙의 의사표시에는 회원의 이용신청에 대한 확인 및 서비스제공 가능여부, 이용신청의 정정, 취소 등에 관한 정보 등을 포함합니다.</li>
            </ol>
          </section>

          {/* 제25조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제25조 콘텐츠 및 재화의 공급</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 콘텐츠 및 재화의 공급시기에 관하여 이용자와 맺은 별도의 약정이 없는 이상, 이용자가 청약을 한 날부터 14일 이내에 재화 등을 배송할 수 있도록 주문, 포장 등 기타의 필요한 조치를 취합니다.</li>
              <li>회사는 이용자가 구매한 재화에 대한 공급 절차 및 진행 사항을 확인할 경우 문의 사항에 신속히 응대합니다.</li>
            </ol>
          </section>

          {/* 제26조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제26조 제3자의 지적재산권 및 저작권 공지</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사와 회원은 제3자의 지적재산을 존중하며, 회사는 언제든지 제3자의 지적 재산을 침해하는 회원과의 거래를 해지할 수 있습니다.</li>
              <li>회사는 회원이 제출하고, 등록한 콘텐츠가 제3자의 저작권을 침해했다고 통지 받는 경우, 저작권법 및 관련법령에 따라 해당 자료를 사이트에서 제거할 수 있습니다.</li>
              <li>자신의 저작권이 침해되었다고 믿는 제3자의 경우, 다음 정보를 포함하는 서면 통지를 작성하여 회사에 제공하여야 합니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>저작권 소유자 또는 법적 대리인의 전자 서명 혹은 실질 서명</li>
                  <li>침해를 주장하는 콘텐츠</li>
                  <li>침해를 주장하는 콘텐츠가 게시 혹은 사용된 사이트 및 앱 위치에 대한 상세한 기술</li>
                  <li>저작권 소유자 또는 그 법적 대리인의 주소, 전화번호 및 이메일 주소</li>
                  <li>침해를 주장하는 서면 통지상의 모든 정보가 사실과 부합하며, 위증으로 판명될 경우 법적 책임을 지겠다는 저작권 소유자 또는 법적 대리인의 진술</li>
                </ul>
              </li>
              <li>회원은 자신의 콘텐츠가 실수 또는 오인으로 인해 삭제 혹은 접근불가상태가 되었다고 믿는 경우, 다음 정보를 포함하는 서면 통지를 작성하여 회사에 제공하여야 합니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>회원의 전자서명 혹은 실질 서명</li>
                  <li>삭제 혹은 접근불가상태가 된 콘텐츠가 게시되어 있던 사이트 위치에 대한 상세한 기술</li>
                  <li>실수 또는 오인의 결과로 자신의 콘텐츠가 삭제 혹은 접근불가상태가 되었다고 믿는 진술과 이와 같은 진술이 위증으로 판명될 경우 법적 책임을 지겠다는 서약</li>
                  <li>회원의 성명, 주소, 전화번호 및 이메일 주소</li>
                </ul>
              </li>
              <li>회사는 본 조항과 관련된 제3자 또는 회원의 통지가 위에서 기술한 요구사항에 부합하지 않을 경우, 해당 통지는 유효하지 않은 것으로 간주할 수 있으며, 이에 대해 응하거나 회답해야 할 책임이 없습니다.</li>
            </ol>
          </section>

          {/* 제27조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제27조 수수료</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원의 사이트 및 앱 가입은 무료이며, 특정 서비스 이용 시에만 수수료가 부과됩니다.</li>
              <li>서비스 수수료 정책은 회사 서비스에서 정의한 규칙에 따르며, 회원은 서비스 이용에 대한 수수료를 부담해야 합니다.</li>
              <li>서비스 수수료 정책은 회사의 사정에 따라 변경될 수 있으며, 회사는 사전에 사이트를 통해 변경내용을 고지합니다.</li>
              <li>회원은 회사의 서비스 수수료 외에 회원의 결제수단(신용카드, 휴대폰, 계좌이체 등)이용에 따른 수수료를 부담해야 합니다.</li>
            </ol>
          </section>

          {/* 제28조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제28조 회원탈퇴 및 자격상실</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회원은 회사에 언제든지 회원탈퇴를 요청할 수 있으며, 회사는 회원탈퇴에 관한 규정에 따라 이를 처리합니다.</li>
              <li>회사는 회원이 다음 각 호의 사유에 해당하는 경우, 사전통지 없이 회원자격을 제한 및 정지시킬 수 있습니다.
                <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-slate-500">
                  <li>가입신청 시에 허위 내용을 등록한 경우</li>
                  <li>사이트를 이용하여 결제한 대금, 기타 회사 이용에 관련하여 회원이 부담하는 채무를 기일에 이행하지 않는 경우</li>
                  <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자거래질서를 위협하는 경우</li>
                  <li>회사를 이용하여 법령과 이 약관이 금지하거나 공공질서 미풍양속에 반하는 행위를 하는 경우</li>
                </ul>
              </li>
              <li>회사가 회원자격을 제한, 정지시킨 후 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 회사는 회원자격을 상실시킬 수 있습니다.</li>
              <li>회사가 회원자격을 상실시키는 경우에는 회원등록을 말소합니다. 이 경우 회원에게 이를 통지하고, 회원등록 말소 전에 소명할 기회를 부여합니다.</li>
              <li>회사는 회원이 이 약관의 내용에 위배되는 행동을 한 경우, 임의로 서비스 사용을 제한 및 중지하거나 본인의 동의 없이 이용계약을 해지할 수 있습니다. 이 경우 회사는 회원의 접속을 금지할 수 있으며, 회원이 게시한 내용의 전부 또는 일부를 임의로 삭제할 수 있습니다.</li>
            </ol>
          </section>

          {/* 제29조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제29조 이용자의 통신판매중개서비스 이용</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 통신판매중개서비스와 관련하여 통신판매중개자로서 통신판매의 당사자가 아니며, 이용자와 통신판매중개의뢰자(이하 &quot;거래당사자&quot;라 한다) 간의 자유로운 재화 등의 거래를 위한 서비스를 운영 및 관리 제공할 뿐이므로 이용자는 통신판매중개의뢰자로부터 재화 등을 구매하기 전에 반드시 재화등의 상세 내용과 거래 조건을 정확하게 확인해야 합니다.</li>
              <li>이용자는 본 약관 및 회사가 서비스 화면에서 공지하는 내용을 준수하여야 하고, 본 약관 및 공지 내용을 위반하거나 이행하지 않아 발생하는 모든 손실과 손해에 대해 책임을 부담합니다.</li>
              <li>이용자는 통신판매중개의뢰자와의 거래 절차에서 분쟁이 발생하면, 분쟁의 해결을 위해 성실히 임해야 하며, 분쟁해결 절차에서 이용자의 불성실 등 이용자의 귀책사유로 발생한 통신판매중개의뢰자 및 회사의 손실과 손해에 대해서는 이용자가 모든 책임을 부담해야 합니다.</li>
              <li>이용자는 회사가 이용자의 서비스 이용 편의를 높이기 위해 통신판매중개의뢰자 등으로부터 제공받은 재화 등 관련 정보와 기타 광고 등을 제공하는 경우에도 해당 재화등의 구매와 관련하여 이용자 자신의 판단과 책임으로 결정하여야 합니다. 이 경우 회사는 어떠한 경우에도 이용자의 구매결정에 대하여 책임을 부담하지 않습니다.</li>
            </ol>
          </section>

          {/* 제30조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제30조 통신판매중개서비스에 대한 면책조항</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 통신판매중개자로서 거래당사자 간의 자유로운 재화 등의 거래를 위한 정보를 제공, 통신판매중개서비스를 운영 및 관리 제공할 뿐이므로 이용자 또는 통신판매중개의뢰자를 대리하지 않으며, 거래당사자 사이에 성립된 거래와 관련된 책임과 이용자 또는 통신판매중개의뢰자가 제공한 정보에 대한 책임은 해당 이용자 또는 통신판매중개의뢰자가 직접 부담해야 합니다.</li>
              <li>회사는 통신판매중개의뢰자가 제공한 재화 등의 내용과 거래조건, 광고 정보 등에 대해서 어떠한 보증이나 대리를 하지 않습니다. 따라서 이용자는 스스로 책임지고 재화 등을 구매해야합니다.</li>
              <li>회사는 거래당사자 간의 모든 행위(거래행위 포함)와 관련하여 판매의사 또는 구매의사의 여부 및 진정성, 광고수단에 제공되는 재화 등의 품질, 완전성, 안전성, 적법성 및 타인의 권리관계에 대한 비침해성, 이용자 또는 통신판매중개의뢰자가 입력하는 정보 및 그 정보를 통하여 링크된 URL에 게재된 자료의 진실성 또는 적법성 등 일체에 대하여 보증하지 아니하며, 이와 관련된 일체의 위험과 책임은 해당 당사자가 부담합니다.</li>
              <li>회사는 이용자의 귀책사유로 인한 서비스의 이용의 장애 및 이용자가 본인의 개인정보를 타인에게 유출하거나 제공하여 발생하는 피해에 대하여 책임을 부담하지 아니합니다.</li>
            </ol>
          </section>

          {/* 제31조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제31조 양도금지</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              회원은 서비스의 이용권한, 기타 이용계약상의 지위를 타인에게 양도 및 증여할 수 없으며, 이를 담보로 제공할 수 없습니다.
            </p>
          </section>

          {/* 제32조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제32조 손해배상</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 회사가 고의로 행한 범죄행위를 제외하고 이에 대하여 책임을 부담하지 아니합니다.
            </p>
          </section>

          {/* 제33조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제33조 면책조항</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 천재지변, 전쟁 및 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 대한 책임이 면제됩니다.</li>
              <li>회사는 기간통신 사업자가 전기통신 서비스를 중지하거나 정상적으로 제공하지 아니하여 손해가 발생한 경우 책임이 면제됩니다.</li>
              <li>회사는 서비스용 설비의 보수, 교체, 정기점검, 공사 등 부득이한 사유로 발생한 손해에 대한 책임이 면제됩니다.</li>
              <li>회사는 이용자의 컴퓨터 오류에 의해 손해가 발생한 경우, 또는 회원이 신상정보 및 전자우편 주소를 부실하게 기재하여 손해가 발생한 경우 책임을 지지 않습니다.</li>
              <li>회사는 회원이나 제3자에 의해 표출된 어떠한 의견이나 정보에 대해 확신이나 대표할 의무가 없으며 의견을 승인하거나 반대하거나 수정하지 않습니다. 회사는 어떠한 경우라도 회원이 서비스에 담긴 정보에 의존해 얻은 이득이나 입은 손해에 대해 책임이 없습니다.</li>
              <li>회사는 회원간 또는 회원과 제3자간에 서비스를 매개로 하여 물품거래 혹은 금전적 거래 등과 관련하여 어떠한 책임도 부담하지 아니하고, 회원이 서비스의 이용과 관련하여 기대하는 이익에 관하여 책임을 부담하지 않습니다.</li>
              <li>회사는 이용자 또는 기타 유관기관이 서비스에 게재한 정보에 대해 정확성, 신뢰도에 대하여 보장하지 않습니다. 따라서 회사는 이용자가 위 내용을 이용함으로 인해 입게 된 모든 종류의 손실이나 손해에 대하여 책임을 부담하지 아니합니다.</li>
              <li>회사는 이용자가 서비스 이용과 관련하여 가입자에게 발생한 손해 중 가입자의 고의, 과실에 의한 손해 및 타 이용자로 인해 입게 되는 정신적 피해에 대하여 보상할 책임을 지지 않습니다.</li>
            </ol>
          </section>

          {/* 제34조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제34조 분쟁해결</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위해서 피해보상처리 기구를 설치, 운영합니다.</li>
              <li>회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보합니다.</li>
            </ol>
          </section>

          {/* 제45조 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제45조 준거법 및 관할법원</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>이 약관의 해석 및 회원간의 분쟁에 대하여는 대한민국의 법을 적용합니다.</li>
              <li>서비스 이용 중 발생한 회원과 회사간의 소송은 민사소송법상의 관할법원에 소를 제기할 수 있습니다.</li>
            </ol>
          </section>

          {/* 부칙 */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">부칙</h2>
            <ol className="text-sm text-slate-600 leading-relaxed space-y-2 list-decimal list-inside">
              <li>이 약관은 2024년 7월 1일부터 적용합니다.</li>
              <li>2024년 4월 14일부터 시행되던 종전의 약관은 본 약관으로 대체합니다.</li>
            </ol>
          </section>
        </div>

        {/* Footer spacing */}
        <div className="h-16" />
      </main>
    </div>
  );
}
