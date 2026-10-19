'use client';
// Converted from the supplied October 16 design; production state is supplied separately.
import React from 'react';
import { css, NoticeEditor } from './reference-style';
export function Template(values) {
  const {
    a,
    actor,
    addMemo,
    admins,
    b,
    closeDate,
    closeModal,
    closeSel,
    ctNew,
    ctNewZ,
    daysLeft,
    doDelete,
    doExport,
    exportN,
    f,
    filters,
    goAdm,
    goCt,
    goHome,
    goLog,
    goNotice,
    goPoc,
    goRelogin,
    hasSel,
    hasToast,
    idle,
    isAdm,
    isCt,
    isEmptyRows,
    isList,
    isLog,
    isPoc,
    k1,
    k1s,
    k2,
    k2l,
    k2s,
    k3,
    k3l,
    k3s,
    keepAlive,
    l,
    logs,
    m,
    memo,
    onMemo,
    onQ,
    openDelete,
    openExport,
    pageTitle,
    pocNew,
    pocNewZ,
    q,
    r,
    rows,
    s,
    showDelete,
    showExport,
    showSessExpired,
    showWarn,
    signOut,
    stBtns,
    tabAdmCls,
    tabCtCls,
    tabLogCls,
    tabPocCls,
    toast,
    warnLeft,
    x,
  } = values;
  return (
    <>
      <style>
        {
          "\nhtml,body{margin:0;padding:0;background:#020406;-webkit-font-smoothing:antialiased;word-break:keep-all;overflow-wrap:break-word;}\n*{box-sizing:border-box;}\na{color:#F8FAFC;text-decoration:none;}\n.mono{font-family:'IBM Plex Mono','Noto Sans KR',monospace;}\n.ad-in{height:48px;padding:0 16px;border-radius:12px;border:1px solid rgba(214,230,255,0.28);background:rgba(2,4,6,0.6);color:#F8FAFC;font-family:'Noto Sans KR',sans-serif;font-size:15px;outline:none;width:100%;}\n.ad-in:focus{border-color:#D6E6FF;box-shadow:0 0 0 3px rgba(214,230,255,0.15);}\n.ad-in::placeholder{color:#64748B;}\n.ad-in.err{border-color:rgba(248,113,113,0.8);}\n.ad-b{height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 18px;border-radius:12px;border:1px solid rgba(214,230,255,0.32);background:transparent;color:#E2E8F0;font-family:'Noto Sans KR',sans-serif;font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap;transition:border-color .2s,box-shadow .2s,background .2s;}\n.ad-b:hover{border-color:rgba(214,230,255,0.8);color:#F8FAFC;}\n.ad-b.pri{background:#F8FAFC;border-color:#F8FAFC;color:#0B1118;font-weight:700;}\n.ad-b.pri:hover{box-shadow:0 0 0 4px rgba(214,230,255,0.3);color:#0B1118;}\n.ad-b.dng{border-color:rgba(248,113,113,0.5);color:#FCA5A5;}\n.ad-b.dng:hover{background:rgba(248,113,113,0.08);}\n.ad-b.txt{border-color:transparent;color:#94A3B8;padding:0 8px;}\n.ad-b.txt:hover{color:#F8FAFC;}\n.ad-b.sm{height:34px;padding:0 12px;font-size:13px;border-radius:9px;}\n.ad-err{font-size:13px;color:#FCA5A5;}\n.sb-home{display:flex;align-items:center;gap:12px;padding:6px 8px;margin:-6px 0;border:none;border-radius:10px;background:transparent;cursor:pointer;transition:background .2s,opacity .2s;}\n.sb-home:hover{background:rgba(214,230,255,0.06);}\n.sb-home:hover img{opacity:0.85;}\n\n.sb button.sbi{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;height:42px;padding:0 12px;border-radius:10px;border:none;background:transparent;color:#94A3B8;font-family:'Noto Sans KR',sans-serif;font-size:14px;cursor:pointer;text-align:left;}\n.sb button.sbi:hover{color:#F8FAFC;background:rgba(214,230,255,0.05);}\n.sb button.sbi.on{color:#F8FAFC;background:rgba(214,230,255,0.1);font-weight:500;}\n.cnt{min-width:22px;height:20px;padding:0 7px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:11px;background:#D6E6FF;color:#0B1118;}\n.cnt.z{background:rgba(214,230,255,0.1);color:#64748B;}\n.kpi{display:flex;flex-direction:column;gap:8px;padding:18px 20px;border-radius:16px;border:1px solid rgba(214,230,255,0.14);background:rgba(214,230,255,0.025);}\n.kpi .v{font-family:'Saira Condensed','Noto Sans KR',sans-serif;font-size:34px;font-weight:600;line-height:1;color:#F8FAFC;}\n.kpi .l{font-size:13px;color:#94A3B8;}\n.kpi .s{font-size:12px;color:#64748B;}\n.fc{height:34px;display:inline-flex;align-items:center;gap:6px;padding:0 12px;border-radius:999px;border:1px solid rgba(214,230,255,0.2);background:transparent;color:#CBD5E1;font-family:'Noto Sans KR',sans-serif;font-size:13px;cursor:pointer;}\n.fc:hover{border-color:rgba(214,230,255,0.6);}\n.fc.on{background:#F8FAFC;border-color:#F8FAFC;color:#0B1118;font-weight:700;}\n.fc .n{font-family:'IBM Plex Mono',monospace;font-size:11px;opacity:0.7;}\n.tb{display:flex;flex-direction:column;font-size:14px;}\n.tb .hd,.tb .rw{display:grid;gap:0 14px;padding:0 16px;align-items:start;}\n.tb .hd{padding-top:12px;padding-bottom:12px;font-family:'IBM Plex Mono','Noto Sans KR',monospace;font-size:11px;letter-spacing:0.08em;font-weight:500;color:#64748B;border-bottom:1px solid rgba(214,230,255,0.14);background:#070B10;white-space:nowrap;}\n.tb .rw{padding-top:14px;padding-bottom:14px;border-bottom:1px solid rgba(214,230,255,0.08);color:#CBD5E1;transition:background .15s;}\n.tb .rw > *{min-width:0;}\n.tb .rw.ck{cursor:pointer;}\n.tb .rw.ck:hover{background:rgba(214,230,255,0.04);}\n.tb .rw.sel{background:rgba(214,230,255,0.08);box-shadow:inset 3px 0 0 #D6E6FF;}\n.tb .strong{color:#F8FAFC;font-weight:500;}\n.tb .ell{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n.g-poc{grid-template-columns:96px 1.5fr 0.8fr 1fr 0.9fr 84px;}\n.g-ct{grid-template-columns:96px 84px 1fr 2fr 84px;}\n.g-log{grid-template-columns:140px 200px 120px 1fr 120px;}\n.g-adm{grid-template-columns:1.5fr 1fr 1fr;}\n.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#D6E6FF;box-shadow:0 0 8px rgba(214,230,255,0.9);margin-right:8px;vertical-align:middle;}\n.bd{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:500;white-space:nowrap;border:1px solid transparent;}\n.bd.new{background:rgba(214,230,255,0.16);border-color:rgba(214,230,255,0.5);color:#D6E6FF;}\n.bd.review{background:rgba(251,191,36,0.1);border-color:rgba(251,191,36,0.4);color:#FCD34D;}\n.bd.active{background:rgba(52,211,153,0.1);border-color:rgba(52,211,153,0.4);color:#6EE7B7;}\n.bd.done,.bd.replied{background:rgba(148,163,184,0.1);border-color:rgba(148,163,184,0.3);color:#94A3B8;}\n.bd.hold{background:rgba(248,113,113,0.08);border-color:rgba(248,113,113,0.35);color:#FCA5A5;}\n.dt{display:flex;flex-direction:column;gap:3px;padding:12px 0;border-bottom:1px solid rgba(214,230,255,0.08);}\n.dt .k{font-size:12px;color:#64748B;}\n.dt .v{font-size:14px;line-height:1.6;color:#E2E8F0;}\n.seg{display:flex;flex-wrap:wrap;gap:6px;}\n.seg button{height:32px;padding:0 12px;border-radius:9px;border:1px solid rgba(214,230,255,0.2);background:transparent;color:#94A3B8;font-family:'Noto Sans KR',sans-serif;font-size:13px;cursor:pointer;}\n.seg button:hover{color:#F8FAFC;border-color:rgba(214,230,255,0.5);}\n.seg button.on{background:#F8FAFC;border-color:#F8FAFC;color:#0B1118;font-weight:700;}\n.memo{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border-radius:12px;background:rgba(214,230,255,0.04);border:1px solid rgba(214,230,255,0.08);}\n.mdl{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-start;justify-content:center;padding:180px 20px 20px;background:rgba(2,4,6,0.66);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}\n.mdl-c{width:min(460px,100%);display:flex;flex-direction:column;gap:16px;padding:28px;border-radius:20px;border:1px solid rgba(214,230,255,0.28);background:#0B1118;box-shadow:0 40px 100px rgba(0,0,0,0.6);}\n.warnbar{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 16px;border-radius:14px;border:1px solid rgba(251,191,36,0.5);background:#1A1508;color:#FDE68A;font-size:14px;box-shadow:0 16px 40px rgba(0,0,0,0.5);}\n.toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:12px;background:#F8FAFC;color:#0B1118;font-size:14px;font-weight:500;box-shadow:0 16px 40px rgba(0,0,0,0.4);}\n.panel{border-radius:18px;border:1px solid rgba(214,230,255,0.14);background:rgba(11,17,24,0.7);}\n\n.navlang{display:inline-flex;padding:3px;border-radius:10px;border:1px solid rgba(214,230,255,0.28);background:rgba(2,4,6,0.5);gap:2px;}\n.navlang a{height:28px;min-width:36px;display:inline-flex;align-items:center;justify-content:center;padding:0 9px;border-radius:7px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.06em;color:#94A3B8 !important;transition:background .2s ease,color .2s ease;}\n.navlang a:hover{color:#F8FAFC !important;}\n.navlang a.on{background:#F8FAFC;color:#0B1118 !important;font-weight:500;}\n.navlang.hd a{height:34px;min-width:40px;font-size:12px;}\n"
        }
      </style>
      {'\n'}
      <div
        lang={'ko'}
        style={css(
          "min-height:100vh;display:flex;background:#020406;color:#F8FAFC;font-family:'Noto Sans KR',sans-serif;",
        )}
      >
        {'\n  '}
        <aside
          className={'sb'}
          style={css(
            'width:240px;flex-shrink:0;display:flex;flex-direction:column;gap:28px;padding:22px 16px;border-right:1px solid rgba(214,230,255,0.1);background:#05080C;',
          )}
        >
          {'\n    '}
          <button
            className={'sb-home'}
            onClick={goHome}
            title={'Admin home'}
            aria-label={'Admin home'}
          >
            <img
              src={
                '/itx-console-assets/brand/fa5afd04db046644e14564cf63d6de02.png'
              }
              alt={'itriX'}
              style={css(
                'width:84px;height:auto;display:block;filter:invert(1);',
              )}
            />
            <span
              className={'mono'}
              style={css(
                'font-size:10px;letter-spacing:0.16em;color:#94A3B8;padding:3px 7px;border:1px solid rgba(214,230,255,0.24);border-radius:6px;',
              )}
            >
              {'ADMIN'}
            </span>
          </button>
          {'\n    '}
          <div style={css('display:flex;flex-direction:column;gap:4px;')}>
            {'\n      '}
            <span
              className={'mono'}
              style={css(
                'font-size:10px;letter-spacing:0.14em;color:#475569;padding:0 12px 6px;',
              )}
            >
              {'접수'}
            </span>
            {'\n      '}
            <button className={`sbi ${tabPocCls}`} onClick={goPoc}>
              <span>{'PoC 신청'}</span>
              <span className={`cnt ${pocNewZ}`}>{pocNew}</span>
            </button>
            {'\n      '}
            <button className={`sbi ${tabCtCls}`} onClick={goCt}>
              <span>{'문의'}</span>
              <span className={`cnt ${ctNewZ}`}>{ctNew}</span>
            </button>
            {'\n      '}
            <span
              className={'mono'}
              style={css(
                'font-size:10px;letter-spacing:0.14em;color:#475569;padding:18px 12px 6px;',
              )}
            >
              {'보안'}
            </span>
            {'\n      '}
            <button className={`sbi ${tabLogCls}`} onClick={goLog}>
              <span>{'접속·처리 기록'}</span>
            </button>
            {'\n      '}
            <button className={`sbi ${tabAdmCls}`} onClick={goAdm}>
              <span>{'관리자 계정'}</span>
            </button>
            {'\n    '}
            <button className={'sbi'} onClick={goNotice}>
              {'공지 팝업'}
            </button>
          </div>
          {'\n    '}
          <div
            style={css(
              'margin-top:auto;display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:14px;border:1px solid rgba(214,230,255,0.12);',
            )}
          >
            {'\n      '}
            <span style={css('font-size:13px;color:#E2E8F0;')}>{actor}</span>
            {'\n      '}
            <span
              className={'mono'}
              style={css('font-size:11px;color:#64748B;')}
            >
              {'자동 로그아웃 '}
              {idle}
            </span>
            {'\n      '}
            <a
              className={'ad-b sm'}
              href={'#'}
              style={css('align-self:flex-start;')}
              onClick={signOut}
            >
              {'로그아웃'}
            </a>
            {'\n    '}
          </div>
          {'\n  '}
        </aside>
        {'\n  '}
        <main
          style={css(
            'flex:1;min-width:0;display:flex;flex-direction:column;gap:22px;padding:26px 32px 40px;',
          )}
        >
          {'\n    '}
          <div
            style={css(
              'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;',
            )}
          >
            {'\n      '}
            <div style={css('display:flex;flex-direction:column;gap:4px;')}>
              <span
                className={'mono'}
                style={css(
                  'font-size:11px;letter-spacing:0.12em;color:#64748B;',
                )}
              >
                {'itrix.co.kr/itx-console-7k2m'}
              </span>
              <span style={css('font-size:24px;font-weight:700;')}>
                {pageTitle}
              </span>
            </div>
            {'\n      '}
            <div
              style={css(
                'display:flex;align-items:center;gap:10px;margin-left:auto;',
              )}
            >
              {'\n      '}
              {isList && (
                <>
                  {'\n        '}
                  <div style={css('display:flex;gap:10px;align-items:center;')}>
                    <input
                      className={'ad-in'}
                      style={css('width:280px;height:42px;font-size:14px;')}
                      placeholder={'회사, 이름, 이메일 검색'}
                      value={q}
                      onChange={onQ}
                    />
                    <button
                      className={'ad-b'}
                      onClick={openExport}
                      style={css('height:42px;')}
                    >
                      {'CSV 내보내기'}
                    </button>
                  </div>
                  {'\n      '}
                </>
              )}
              {'\n        '}
              <span
                className={'navlang hd'}
                role={'group'}
                aria-label={'Language'}
              >
                <a className={'on'} href={'/itx-console-7k2m'} lang={'ko'}>
                  {'KO'}
                </a>
                <a
                  className={''}
                  href={'/itx-console-7k2m?lang=en'}
                  lang={'en'}
                >
                  {'EN'}
                </a>
              </span>
              {'\n      '}
            </div>
            {'\n    '}
          </div>
          {'\n\n    '}
          {values.isNotice && <NoticeEditor language={values.language} />}
          {isList && (
            <>
              {'\n      '}
              <div
                style={css(
                  'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;',
                )}
              >
                {'\n        '}
                <div className={'kpi'}>
                  <span className={'l'}>{'확인 전 신규'}</span>
                  <span className={'v'}>{k1}</span>
                  <span className={'s'}>{k1s}</span>
                </div>
                {'\n        '}
                <div className={'kpi'}>
                  <span className={'l'}>{k2l}</span>
                  <span className={'v'}>{k2}</span>
                  <span className={'s'}>{k2s}</span>
                </div>
                {'\n        '}
                <div className={'kpi'}>
                  <span className={'l'}>{k3l}</span>
                  <span className={'v'}>{k3}</span>
                  <span className={'s'}>{k3s}</span>
                </div>
                {'\n        '}
                <div className={'kpi'}>
                  <span className={'l'}>{'PoC 모집 마감'}</span>
                  <span className={'v'}>{daysLeft}</span>
                  <span className={'s'}>{closeDate}</span>
                </div>
                {'\n      '}
              </div>
              {'\n      '}
              <div style={css('display:flex;flex-wrap:wrap;gap:8px;')}>
                {'\n        '}
                {(filters || []).map((f, index) => (
                  <React.Fragment key={f.id ?? index}>
                    <button className={`fc ${f.cls}`} onClick={f.on}>
                      {f.label} <span className={'n'}>{f.n}</span>
                    </button>
                  </React.Fragment>
                ))}
                {'\n      '}
              </div>
              {'\n      '}
              <div style={css('display:flex;gap:16px;align-items:flex-start;')}>
                {'\n        '}
                <div
                  className={'panel'}
                  style={css('flex:1;min-width:0;overflow:hidden;')}
                >
                  {'\n          '}
                  {isPoc && (
                    <>
                      {'\n            '}
                      <div className={'tb'}>
                        <div className={'hd g-poc'}>
                          <span>{'접수일'}</span>
                          <span>{'회사'}</span>
                          <span>{'담당자'}</span>
                          <span>{'업종'}</span>
                          <span>{'희망 시기'}</span>
                          <span>{'상태'}</span>
                        </div>
                        {'\n              '}
                        {(rows || []).map((r, index) => (
                          <React.Fragment key={r.id ?? index}>
                            <div
                              className={`rw ck g-poc ${r.sel}`}
                              onClick={r.pick}
                            >
                              <span
                                className={'mono'}
                                style={css(
                                  'font-size:12px;color:#94A3B8;white-space:nowrap;padding-top:2px;',
                                )}
                              >
                                {r.d}
                              </span>
                              <span className={'strong'}>
                                {r.isNew && (
                                  <>
                                    <span className={'dot'}></span>
                                  </>
                                )}
                                {r.company}
                              </span>
                              <span>{r.name}</span>
                              <span>{r.ind}</span>
                              <span>{r.when}</span>
                              <span>
                                <span className={`bd ${r.st}`}>{r.stl}</span>
                              </span>
                            </div>
                          </React.Fragment>
                        ))}
                        {'\n            '}
                      </div>
                      {'\n          '}
                    </>
                  )}
                  {'\n          '}
                  {isCt && (
                    <>
                      {'\n            '}
                      <div className={'tb'}>
                        <div className={'hd g-ct'}>
                          <span>{'접수일'}</span>
                          <span>{'유형'}</span>
                          <span>{'이름'}</span>
                          <span>{'내용'}</span>
                          <span>{'상태'}</span>
                        </div>
                        {'\n              '}
                        {(rows || []).map((r, index) => (
                          <React.Fragment key={r.id ?? index}>
                            <div
                              className={`rw ck g-ct ${r.sel}`}
                              onClick={r.pick}
                            >
                              <span
                                className={'mono'}
                                style={css(
                                  'font-size:12px;color:#94A3B8;white-space:nowrap;padding-top:2px;',
                                )}
                              >
                                {r.d}
                              </span>
                              <span style={css('white-space:nowrap;')}>
                                {r.topic}
                              </span>
                              <span
                                className={'strong'}
                                style={css('white-space:nowrap;')}
                              >
                                {r.isNew && (
                                  <>
                                    <span className={'dot'}></span>
                                  </>
                                )}
                                {r.name}
                              </span>
                              <span>
                                <span className={'ell'}>{r.msg}</span>
                              </span>
                              <span>
                                <span className={`bd ${r.st}`}>{r.stl}</span>
                              </span>
                            </div>
                          </React.Fragment>
                        ))}
                        {'\n            '}
                      </div>
                      {'\n          '}
                    </>
                  )}
                  {'\n          '}
                  {isEmptyRows && (
                    <>
                      <div
                        style={css(
                          'padding:48px;text-align:center;font-size:14px;color:#64748B;',
                        )}
                      >
                        {'조건에 맞는 접수 건이 없습니다.'}
                      </div>
                    </>
                  )}
                  {'\n        '}
                </div>
                {'\n        '}
                {hasSel && (
                  <>
                    {'\n          '}
                    <div
                      className={'panel'}
                      style={css(
                        'width:420px;flex-shrink:0;display:flex;flex-direction:column;gap:18px;padding:22px;',
                      )}
                    >
                      {'\n            '}
                      <div
                        style={css(
                          'display:flex;justify-content:space-between;align-items:flex-start;gap:12px;',
                        )}
                      >
                        <div
                          style={css(
                            'display:flex;flex-direction:column;gap:6px;',
                          )}
                        >
                          <span
                            className={'mono'}
                            style={css(
                              'font-size:11px;letter-spacing:0.1em;color:#64748B;',
                            )}
                          >
                            {s.id}
                            {' · '}
                            {s.date}
                          </span>
                          <span style={css('font-size:20px;font-weight:700;')}>
                            {s.title}
                          </span>
                        </div>
                        <button className={'ad-b txt sm'} onClick={closeSel}>
                          {'✕'}
                        </button>
                      </div>
                      {'\n            '}
                      <div
                        style={css(
                          'display:flex;flex-direction:column;gap:8px;',
                        )}
                      >
                        <span style={css('font-size:12px;color:#64748B;')}>
                          {'처리 상태'}
                        </span>
                        <div className={'seg'}>
                          {(stBtns || []).map((b, index) => (
                            <React.Fragment key={b.id ?? index}>
                              <button className={b.cls} onClick={b.on}>
                                {b.label}
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      {'\n            '}
                      <div style={css('display:flex;flex-direction:column;')}>
                        {(s.fields || []).map((x, index) => (
                          <React.Fragment key={x.id ?? index}>
                            <div className={'dt'}>
                              <span className={'k'}>{x.k}</span>
                              <span className={'v'}>{x.v}</span>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                      {'\n            '}
                      <div
                        style={css(
                          'display:flex;flex-direction:column;gap:8px;',
                        )}
                      >
                        <span style={css('font-size:12px;color:#64748B;')}>
                          {'동의 내역'}
                        </span>
                        <div
                          style={css(
                            'display:flex;flex-direction:column;gap:6px;font-size:13px;color:#CBD5E1;',
                          )}
                        >
                          <span>
                            {'✓ 개인정보 수집·이용 (필수) · '}
                            {s.date}
                          </span>
                          <span style={css(`color:${s.mktColor};`)}>
                            {s.mkt}
                          </span>
                        </div>
                      </div>
                      {'\n            '}
                      <div
                        style={css(
                          'display:flex;flex-direction:column;gap:8px;',
                        )}
                      >
                        <span style={css('font-size:12px;color:#64748B;')}>
                          {'내부 메모'}
                        </span>
                        {'\n              '}
                        {(s.memos || []).map((m, index) => (
                          <React.Fragment key={m.id ?? index}>
                            <div className={'memo'}>
                              <span
                                style={css(
                                  'font-size:13px;line-height:1.6;color:#E2E8F0;',
                                )}
                              >
                                {m.t}
                              </span>
                              <span
                                className={'mono'}
                                style={css('font-size:11px;color:#64748B;')}
                              >
                                {m.by}
                                {' · '}
                                {m.at}
                              </span>
                            </div>
                          </React.Fragment>
                        ))}
                        {'\n              '}
                        <textarea
                          className={'ad-in'}
                          rows={'3'}
                          placeholder={'담당자끼리 공유할 메모를 남겨 주세요.'}
                          value={memo}
                          onChange={onMemo}
                          style={css(
                            'height:auto;padding:12px 14px;resize:vertical;line-height:1.6;font-size:14px;',
                          )}
                        ></textarea>
                        {'\n              '}
                        <button
                          className={'ad-b sm'}
                          onClick={addMemo}
                          style={css('align-self:flex-end;')}
                        >
                          {'메모 저장'}
                        </button>
                        {'\n            '}
                      </div>
                      {'\n            '}
                      <div
                        style={css(
                          'display:flex;justify-content:space-between;gap:10px;padding-top:16px;border-top:1px solid rgba(214,230,255,0.1);',
                        )}
                      >
                        <a className={'ad-b pri'} href={s.mailto}>
                          {'메일로 답장'}
                        </a>
                        <button className={'ad-b dng'} onClick={openDelete}>
                          {'개인정보 삭제'}
                        </button>
                      </div>
                      {'\n          '}
                    </div>
                    {'\n        '}
                  </>
                )}
                {'\n      '}
              </div>
              {'\n    '}
            </>
          )}
          {'\n\n    '}
          {isLog && (
            <>
              {'\n      '}
              <span
                style={css('font-size:14px;line-height:1.6;color:#94A3B8;')}
              >
                {
                  '관리자의 로그인, 조회, 상태 변경, 내보내기, 삭제 기록입니다. 기록은 수정하거나 지울 수 없으며 1년간 보관됩니다.'
                }
              </span>
              {'\n      '}
              <div className={'panel'} style={css('overflow:hidden;')}>
                <div className={'tb'}>
                  <div className={'hd g-log'}>
                    <span>{'일시'}</span>
                    <span>{'관리자'}</span>
                    <span>{'동작'}</span>
                    <span>{'대상'}</span>
                    <span>{'IP'}</span>
                  </div>
                  {'\n        '}
                  {(logs || []).map((l, index) => (
                    <React.Fragment key={l.id ?? index}>
                      <div className={'rw g-log'}>
                        <span
                          className={'mono'}
                          style={css(
                            'font-size:12px;color:#94A3B8;white-space:nowrap;',
                          )}
                        >
                          {l.at}
                        </span>
                        <span>{l.by}</span>
                        <span className={'strong'}>{l.act}</span>
                        <span>{l.target}</span>
                        <span
                          className={'mono'}
                          style={css('font-size:12px;color:#64748B;')}
                        >
                          {l.ip}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                  {'\n      '}
                </div>
              </div>
              {'\n    '}
            </>
          )}
          {'\n\n    '}
          {isAdm && (
            <>
              {'\n      '}
              <span
                style={css('font-size:14px;line-height:1.6;color:#94A3B8;')}
              >
                {
                  '아래 두 이메일만 관리자 로그인 인증코드를 받을 수 있습니다. 다른 주소는 입력해도 거절됩니다.'
                }
              </span>
              {'\n      '}
              <div className={'panel'} style={css('overflow:hidden;')}>
                <div className={'tb'}>
                  <div className={'hd g-adm'}>
                    <span>{'이메일'}</span>
                    <span>{'권한'}</span>
                    <span>{'마지막 로그인'}</span>
                  </div>
                  {'\n        '}
                  {(admins || []).map((a, index) => (
                    <React.Fragment key={a.id ?? index}>
                      <div
                        className={'rw g-adm'}
                        style={css('align-items:center;')}
                      >
                        <span className={'strong'}>{a.email}</span>
                        <span>{a.role}</span>
                        <span
                          className={'mono'}
                          style={css('font-size:12px;color:#94A3B8;')}
                        >
                          {a.last}
                        </span>
                        <span style={css('text-align:right;')}>
                          {a.canRemove && (
                            <>
                              <button
                                className={'ad-b dng sm'}
                                onClick={a.remove}
                              >
                                {'삭제'}
                              </button>
                            </>
                          )}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                  {'\n      '}
                </div>
              </div>
              {'\n      '}
              <div
                className={'panel'}
                style={css(
                  'display:flex;gap:14px;align-items:flex-start;padding:18px 20px;',
                )}
              >
                <span
                  style={css('color:#D6E6FF;font-size:16px;line-height:1.4;')}
                >
                  {'🔒'}
                </span>
                <span
                  style={css('font-size:14px;line-height:1.7;color:#CBD5E1;')}
                >
                  {
                    '보안을 위해 허용 이메일 목록은 이 화면에서 바꿀 수 없고, 서버 설정에서만 변경됩니다. 관리자를 추가하거나 빼야 하면 개발 담당자에게 요청해 주세요.'
                  }
                </span>
              </div>
              {'\n    '}
            </>
          )}
          {'\n  '}
        </main>
        {'\n\n  '}
        {showExport && (
          <>
            {'\n    '}
            <div className={'mdl'} role={'dialog'} aria-modal={'true'}>
              <div className={'mdl-c'}>
                {'\n      '}
                <span style={css('font-size:20px;font-weight:700;')}>
                  {'CSV로 내보낼까요?'}
                </span>
                {'\n      '}
                <span
                  style={css('font-size:14px;line-height:1.7;color:#CBD5E1;')}
                >
                  {'현재 목록 '}
                  <b style={css('color:#F8FAFC;')}>
                    {exportN}
                    {'건'}
                  </b>
                  {
                    '을 내보냅니다. 내려받은 파일에는 개인정보가 들어 있으니 업무 목적 외에 공유하지 마세요. 내보내기 기록이 남습니다.'
                  }
                </span>
                {'\n      '}
                <div
                  style={css('display:flex;justify-content:flex-end;gap:10px;')}
                >
                  <button className={'ad-b'} onClick={closeModal}>
                    {'취소'}
                  </button>
                  <button className={'ad-b pri'} onClick={doExport}>
                    {'내보내기'}
                  </button>
                </div>
                {'\n    '}
              </div>
            </div>
            {'\n  '}
          </>
        )}
        {'\n  '}
        {showDelete && (
          <>
            {'\n    '}
            <div className={'mdl'} role={'dialog'} aria-modal={'true'}>
              <div className={'mdl-c'}>
                {'\n      '}
                <span
                  style={css('font-size:20px;font-weight:700;color:#FCA5A5;')}
                >
                  {'개인정보를 삭제할까요?'}
                </span>
                {'\n      '}
                <span
                  style={css('font-size:14px;line-height:1.7;color:#CBD5E1;')}
                >
                  <b style={css('color:#F8FAFC;')}>{s.title}</b>
                  {
                    ' 건의 개인정보와 메모를 지웁니다. 지운 뒤에는 되돌릴 수 없고, 삭제 사실만 기록에 남습니다. 이용자의 삭제 요청이나 보유 기간 만료 때 사용하세요.'
                  }
                </span>
                {'\n      '}
                <div
                  style={css('display:flex;justify-content:flex-end;gap:10px;')}
                >
                  <button className={'ad-b'} onClick={closeModal}>
                    {'취소'}
                  </button>
                  <button className={'ad-b dng'} onClick={doDelete}>
                    {'삭제'}
                  </button>
                </div>
                {'\n    '}
              </div>
            </div>
            {'\n  '}
          </>
        )}
        {'\n  '}
        {showWarn && (
          <>
            <div className={'warnbar'} role={'alert'}>
              <span>{'⏱'}</span>
              <span>
                <b className={'mono'} style={css('font-weight:500;')}>
                  {warnLeft}
                </b>
                {' 후 자동으로 로그아웃됩니다.'}
              </span>
              <button className={'ad-b sm pri'} onClick={keepAlive}>
                {'로그인 유지'}
              </button>
            </div>
          </>
        )}
        {'\n  '}
        {showSessExpired && (
          <>
            {'\n    '}
            <div
              className={'mdl'}
              role={'alertdialog'}
              aria-modal={'true'}
              style={css('z-index:70;')}
            >
              <div className={'mdl-c'}>
                {'\n      '}
                <span style={css('font-size:20px;font-weight:700;')}>
                  {'세션이 만료되었습니다'}
                </span>
                {'\n      '}
                <span
                  style={css('font-size:14px;line-height:1.7;color:#CBD5E1;')}
                >
                  {
                    '30분 동안 활동이 없어 보안을 위해 로그아웃되었습니다. 저장하지 않은 메모는 남지 않습니다. 다시 로그인해 주세요.'
                  }
                </span>
                {'\n      '}
                <div style={css('display:flex;justify-content:flex-end;')}>
                  <a className={'ad-b pri'} href={'#'} onClick={signOut}>
                    {'다시 로그인'}
                  </a>
                </div>
                {'\n    '}
              </div>
            </div>
            {'\n  '}
          </>
        )}
        {'\n  '}
        {hasToast && (
          <>
            <div className={'toast'}>
              {'✓ '}
              {toast}
            </div>
          </>
        )}
        {'\n'}
      </div>
      {'\n'}
    </>
  );
}
