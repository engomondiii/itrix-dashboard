'use client';
import React, { useEffect, useState } from 'react';
import { Template as EN } from './reference/Admin_Login_EN.dc.template';
import { Template as KO } from './reference/Admin_Login.dc.template';
import { api } from './api';
export default function Login() {
  const [language, setLanguage] = useState('ko'),
    [step, setStep] = useState('email'),
    [email, setEmail] = useState(''),
    [code, setCode] = useState(''),
    [error, setError] = useState(''),
    [left, setLeft] = useState(300),
    [busy, setBusy] = useState(false),
    [expired, setExpired] = useState(false),
    [tries, setTries] = useState(5);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const init = setTimeout(() => { setLanguage(q.get('lang') === 'en' ? 'en' : 'ko'); setExpired(q.has('expired')); }, 0);
    const t = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => { clearTimeout(init); clearInterval(t); };
  }, []);
  async function send() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api('auth/request', { email, language });
      setStep('code');
      setCode('');
      setLeft(300);
    } catch (e) {
      if (e.reason === 'locked') setStep('locked');
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    if (busy || left <= 0 || code.length !== 6) return;
    setBusy(true);
    setError('');
    try {
      await api('auth/verify', { email, language, code });
      setStep('done');
    } catch (e) {
      if (e.remainingAttempts !== undefined) setTries(Number(e.remainingAttempts));
      if (e.reason === 'locked') setStep('locked');
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const T = language === 'en' ? EN : KO;
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Saira+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
      />
      <div
        aria-busy={busy}
        style={busy ? { pointerEvents: 'none', opacity: 0.7 } : {}}
      >
        <T
          isEmail={step === 'email'}
          isCode={step === 'code'}
          isLocked={step === 'locked'}
          isDone={step === 'done'}
          showExpired={expired && step === 'email'}
          email={email}
          onEmail={(e) => setEmail(e.target.value)}
          emailErr={step === 'email' ? error : ''}
          hasEmailErr={step === 'email' && !!error}
          emailErrCls={error ? 'err' : ''}
          emailShown={email}
          code={code}
          onCode={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          codeErr={step === 'code' ? error : ''}
          hasCodeErr={step === 'code' && !!error}
          codeErrCls={error ? 'err' : ''}
          timer={
            String(Math.floor(left / 60)).padStart(2, '0') +
            ':' +
            String(left % 60).padStart(2, '0')
          }
          tries={tries}
          triesLeft={tries}
          sendCode={send}
          verify={verify}
          resend={send}
          backEmail={async () => {
            if (step === 'done')
              await api('admin/session', { action: 'logout' });
            setStep('email');
            setCode('');
            setError('');
          }}
        />
      </div>
    </>
  );
}
