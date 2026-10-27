export default function Retired() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#020406',
        color: '#F8FAFC',
        padding: 'clamp(24px,8vw,100px)',
        fontFamily: 'sans-serif',
      }}
    >
      <img src="/brand/itrix-logo-inverse.svg" alt="itriX" width="150" />
      <h1>Website intake has moved to Google Forms</h1>
      <p>
        웹사이트 접수는 Google Forms로 이전되었습니다. 기존 관리자 콘솔은 더
        이상 사용하지 않습니다.
      </p>
      <p>
        The website administrator console and its sign-in are no longer in use.
        Authorized team members can review submissions in the company’s Google
        Forms account.
      </p>
      <a href="https://itrix.co.kr" style={{ color: '#D6E6FF' }}>
        itriX website →
      </a>
    </main>
  );
}
