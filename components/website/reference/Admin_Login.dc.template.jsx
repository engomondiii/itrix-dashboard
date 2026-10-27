'use client';
// Converted from the supplied October 16 design; production state is supplied separately.
import React from 'react';
import { css, NoticeEditor } from './reference-style';
export function Template(values) {
  const {
    backEmail,
    code,
    codeErr,
    codeErrCls,
    email,
    emailErr,
    emailErrCls,
    emailShown,
    hasCodeErr,
    hasEmailErr,
    isCode,
    isDone,
    isEmail,
    isLocked,
    onCode,
    onEmail,
    resend,
    sendCode,
    showExpired,
    timer,
    triesLeft,
    verify,
  } = values;
  return (
    <>
      <style>
        {
          "\nhtml,body{margin:0;padding:0;background:#020406;-webkit-font-smoothing:antialiased;word-break:keep-all;overflow-wrap:break-word;}\n*{box-sizing:border-box;}\na{color:#F8FAFC;text-decoration:none;}\n.mono{font-family:'IBM Plex Mono','Noto Sans KR',monospace;}\n.ad-in{height:48px;padding:0 16px;border-radius:12px;border:1px solid rgba(214,230,255,0.28);background:rgba(2,4,6,0.6);color:#F8FAFC;font-family:'Noto Sans KR',sans-serif;font-size:15px;outline:none;width:100%;}\n.ad-in:focus{border-color:#D6E6FF;box-shadow:0 0 0 3px rgba(214,230,255,0.15);}\n.ad-in::placeholder{color:#64748B;}\n.ad-in.err{border-color:rgba(248,113,113,0.8);}\n.ad-b{height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 18px;border-radius:12px;border:1px solid rgba(214,230,255,0.32);background:transparent;color:#E2E8F0;font-family:'Noto Sans KR',sans-serif;font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap;transition:border-color .2s,box-shadow .2s,background .2s;}\n.ad-b:hover{border-color:rgba(214,230,255,0.8);color:#F8FAFC;}\n.ad-b.pri{background:#F8FAFC;border-color:#F8FAFC;color:#0B1118;font-weight:700;}\n.ad-b.pri:hover{box-shadow:0 0 0 4px rgba(214,230,255,0.3);color:#0B1118;}\n.ad-b.dng{border-color:rgba(248,113,113,0.5);color:#FCA5A5;}\n.ad-b.dng:hover{background:rgba(248,113,113,0.08);}\n.ad-b.txt{border-color:transparent;color:#94A3B8;padding:0 8px;}\n.ad-b.txt:hover{color:#F8FAFC;}\n.ad-b.sm{height:34px;padding:0 12px;font-size:13px;border-radius:9px;}\n.ad-err{font-size:13px;color:#FCA5A5;}\n.sb-home{display:flex;align-items:center;gap:12px;padding:6px 8px;margin:-6px 0;border:none;border-radius:10px;background:transparent;cursor:pointer;transition:background .2s,opacity .2s;}\n.sb-home:hover{background:rgba(214,230,255,0.06);}\n.sb-home:hover img{opacity:0.85;}\n\n.lg-code{letter-spacing:0.6em;font-family:'IBM Plex Mono',monospace;font-size:22px;text-align:center;height:60px;}\n.lg-note{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.6;color:#94A3B8;}\n.lg-note span:first-child{color:#D6E6FF;}\n.navlang{display:inline-flex;padding:3px;border-radius:10px;border:1px solid rgba(214,230,255,0.28);background:rgba(2,4,6,0.5);gap:2px;}\n.navlang a{height:28px;min-width:36px;display:inline-flex;align-items:center;justify-content:center;padding:0 9px;border-radius:7px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.06em;color:#94A3B8 !important;transition:background .2s ease,color .2s ease;}\n.navlang a:hover{color:#F8FAFC !important;}\n.navlang a.on{background:#F8FAFC;color:#0B1118 !important;font-weight:500;}\n"
        }
      </style>
      {'\n'}
      <div
        lang={'ko'}
        style={css(
          "min-height:100vh;display:flex;flex-direction:column;background:radial-gradient(50% 60% at 50% 0%, rgba(120,160,175,0.18) 0%, rgba(2,4,6,0) 70%), #020406;color:#F8FAFC;font-family:'Noto Sans KR',sans-serif;",
        )}
      >
        {'\n  '}
        <div
          style={css(
            'display:flex;justify-content:space-between;align-items:center;padding:20px 40px;',
          )}
        >
          {'\n    '}
          <a
            className={'sb-home'}
            href={'/itx-console-7k2m/sign-in'}
            title={'Admin home'}
            aria-label={'Admin home'}
            style={css('gap:14px;')}
          >
            <img
              src={
                '/itx-console-assets/brand/itrix-logo-inverse.svg'
              }
              alt={'itriX'}
              style={css(
                'width:96px;height:auto;display:block;',
              )}
            />
            <span
              className={'mono'}
              style={css(
                'font-size:11px;letter-spacing:0.16em;color:#94A3B8;padding:4px 8px;border:1px solid rgba(214,230,255,0.24);border-radius:6px;',
              )}
            >
              {'ADMIN'}
            </span>
          </a>
          {'\n    '}
          <div style={css('display:flex;align-items:center;gap:16px;')}>
            <span
              className={'mono'}
              style={css('font-size:12px;letter-spacing:0.04em;color:#64748B;')}
            >
              {'itrix.co.kr/itx-console-7k2m'}
            </span>
            <span className={'navlang'} role={'group'} aria-label={'Language'}>
              <a
                className={'on'}
                href={'/itx-console-7k2m/sign-in'}
                lang={'ko'}
              >
                {'KO'}
              </a>
              <a
                className={''}
                href={'/itx-console-7k2m/sign-in?lang=en'}
                lang={'en'}
              >
                {'EN'}
              </a>
            </span>
          </div>
          {'\n  '}
        </div>
        {'\n  '}
        <div
          style={css(
            'flex:1;display:flex;align-items:center;justify-content:center;padding:40px 20px 80px;',
          )}
        >
          {'\n    '}
          <div
            style={css(
              'width:min(440px,100%);display:flex;flex-direction:column;gap:24px;padding:36px;border-radius:24px;border:1px solid rgba(214,230,255,0.2);background:rgba(11,17,24,0.9);box-shadow:0 40px 100px rgba(0,0,0,0.5);',
            )}
          >
            {'\n      '}
            <div style={css('display:flex;flex-direction:column;gap:8px;')}>
              {'\n        '}
              <span
                className={'mono'}
                style={css(
                  'font-size:12px;letter-spacing:0.14em;color:#D6E6FF;',
                )}
              >
                {'ADMIN CONSOLE'}
              </span>
              {'\n        '}
              <span style={css('font-size:26px;font-weight:700;')}>
                {'관리자 로그인'}
              </span>
              {'\n      '}
            </div>
            {'\n      '}
            {isEmail && (
              <>
                {'\n        '}
                <div
                  style={css('display:flex;flex-direction:column;gap:16px;')}
                >
                  {'\n          '}
                  {showExpired && (
                    <>
                      <div
                        style={css(
                          'display:flex;gap:10px;align-items:flex-start;padding:14px 16px;border-radius:12px;border:1px solid rgba(251,191,36,0.4);background:rgba(251,191,36,0.07);font-size:14px;line-height:1.6;color:#FDE68A;',
                        )}
                      >
                        <span>{'⏱'}</span>
                        <span>
                          {
                            '30분 동안 활동이 없어 보안을 위해 로그아웃되었습니다. 다시 로그인해 주세요.'
                          }
                        </span>
                      </div>
                    </>
                  )}
                  {'\n          '}
                  <span
                    style={css(
                      'font-size:15px;line-height:1.65;color:#CBD5E1;',
                    )}
                  >
                    {'허용된 관리자 이메일로 6자리 인증코드를 보내드립니다.'}
                  </span>
                  {'\n          '}
                  <label
                    style={css('display:flex;flex-direction:column;gap:8px;')}
                  >
                    <span style={css('font-size:13px;color:#CBD5E1;')}>
                      {'관리자 이메일'}
                    </span>
                    <input
                      className={`ad-in ${emailErrCls}`}
                      type={'email'}
                      placeholder={'관리자 이메일 주소'}
                      value={email}
                      onChange={onEmail}
                    />
                  </label>
                  {'\n          '}
                  {hasEmailErr && (
                    <>
                      <span className={'ad-err'}>{emailErr}</span>
                    </>
                  )}
                  {'\n          '}
                  <button
                    className={'ad-b pri'}
                    onClick={sendCode}
                    style={css('height:52px;font-size:15px;')}
                  >
                    {'인증코드 받기'}
                  </button>
                  {'\n        '}
                </div>
                {'\n      '}
              </>
            )}
            {'\n      '}
            {isCode && (
              <>
                {'\n        '}
                <div
                  style={css('display:flex;flex-direction:column;gap:16px;')}
                >
                  {'\n          '}
                  <span
                    style={css(
                      'font-size:15px;line-height:1.65;color:#CBD5E1;',
                    )}
                  >
                    <b style={css('color:#F8FAFC;font-weight:500;')}>
                      {emailShown}
                    </b>
                    {'(으)로 보낸 6자리 코드를 입력해 주세요.'}
                  </span>
                  {'\n          '}
                  <input
                    className={`ad-in lg-code ${codeErrCls}`}
                    inputmode={'numeric'}
                    maxLength={'6'}
                    placeholder={'······'}
                    value={code}
                    onChange={onCode}
                  />
                  {'\n          '}
                  <div
                    style={css(
                      'display:flex;justify-content:space-between;align-items:center;font-size:13px;',
                    )}
                  >
                    <span className={'mono'} style={css('color:#94A3B8;')}>
                      {timer}
                      {' 후 만료'}
                    </span>
                    <span style={css('color:#64748B;')}>
                      {'남은 시도 '}
                      {triesLeft}
                      {'회'}
                    </span>
                  </div>
                  {'\n          '}
                  {hasCodeErr && (
                    <>
                      <span className={'ad-err'}>{codeErr}</span>
                    </>
                  )}
                  {'\n          '}
                  <button
                    className={'ad-b pri'}
                    onClick={verify}
                    style={css('height:52px;font-size:15px;')}
                  >
                    {'로그인'}
                  </button>
                  {'\n          '}
                  <div
                    style={css('display:flex;justify-content:space-between;')}
                  >
                    <button className={'ad-b txt'} onClick={backEmail}>
                      {'← 이메일 변경'}
                    </button>
                    <button className={'ad-b txt'} onClick={resend}>
                      {'코드 다시 받기'}
                    </button>
                  </div>
                  {'\n        '}
                </div>
                {'\n      '}
              </>
            )}
            {'\n      '}
            {isLocked && (
              <>
                {'\n        '}
                <div
                  style={css(
                    'display:flex;flex-direction:column;gap:14px;padding:20px;border-radius:16px;border:1px solid rgba(248,113,113,0.4);background:rgba(248,113,113,0.06);',
                  )}
                >
                  {'\n          '}
                  <span
                    style={css('font-size:17px;font-weight:700;color:#FCA5A5;')}
                  >
                    {'로그인이 잠시 잠겼습니다'}
                  </span>
                  {'\n          '}
                  <span
                    style={css(
                      'font-size:14px;line-height:1.65;color:#CBD5E1;',
                    )}
                  >
                    {
                      '인증코드를 5회 잘못 입력해 15분 동안 로그인할 수 없습니다. 잠금이 풀린 뒤 새 코드를 받아 주세요.'
                    }
                  </span>
                  {'\n          '}
                  <button
                    className={'ad-b'}
                    onClick={backEmail}
                    style={css('align-self:flex-start;')}
                  >
                    {'처음으로'}
                  </button>
                  {'\n        '}
                </div>
                {'\n      '}
              </>
            )}
            {'\n      '}
            {isDone && (
              <>
                {'\n        '}
                <div
                  style={css('display:flex;flex-direction:column;gap:14px;')}
                >
                  {'\n          '}
                  <span
                    style={css(
                      'display:flex;align-items:center;gap:10px;font-size:17px;font-weight:700;',
                    )}
                  >
                    <span
                      style={css(
                        'width:8px;height:8px;border-radius:50%;background:#D6E6FF;box-shadow:0 0 10px rgba(214,230,255,0.8);',
                      )}
                    ></span>
                    {'인증되었습니다'}
                  </span>
                  {'\n          '}
                  <a
                    className={'ad-b pri'}
                    href={'/itx-console-7k2m'}
                    style={css('height:52px;font-size:15px;')}
                  >
                    {'대시보드로 이동 →'}
                  </a>
                  {'\n          '}
                  <button
                    className={'ad-b'}
                    onClick={backEmail}
                    style={css('height:48px;font-size:14px;')}
                  >
                    {'← 로그인 화면으로 돌아가기'}
                  </button>
                  {'\n        '}
                </div>
                {'\n      '}
              </>
            )}
            {'\n      '}
            <div
              style={css(
                'display:flex;flex-direction:column;gap:8px;padding-top:18px;border-top:1px solid rgba(214,230,255,0.12);',
              )}
            >
              {'\n        '}
              <div className={'lg-note'}>
                <span>{'·'}</span>
                <span>{'허용된 관리자 이메일만 코드를 받을 수 있습니다.'}</span>
              </div>
              {'\n        '}
              <div className={'lg-note'}>
                <span>{'·'}</span>
                <span>
                  {'코드는 5분간 유효하며, 5회 틀리면 15분간 잠깁니다.'}
                </span>
              </div>
              {'\n        '}
              <div className={'lg-note'}>
                <span>{'·'}</span>
                <span>
                  {
                    '30분 동안 활동이 없으면 자동으로 로그아웃되고, 모든 접속은 기록됩니다.'
                  }
                </span>
              </div>
              {'\n      '}
            </div>
            {'\n    '}
          </div>
          {'\n  '}
        </div>
        {'\n'}
      </div>
      {'\n'}
    </>
  );
}
