'use client';
import React, { useEffect, useState } from 'react';
import { api } from '../api';
export function css(text) {
  const result = {};
  for (const declaration of String(text || '').split(/;(?![^()]*\))/)) {
    const colon = declaration.indexOf(':');
    if (colon < 0) continue;
    let key = declaration.slice(0, colon).trim();
    if (!key) continue;
    key = key.startsWith('--')
      ? key
      : key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    result[key] = declaration
      .slice(colon + 1)
      .trim()
      .replace(/\s*!important$/, '');
  }
  return result;
}
const blank = () => ({
  label: '',
  title: '',
  intro: '',
  rows: [],
  button: 'Request a PoC',
  link: '/poc',
});
export function NoticeEditor({ language }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [preview, setPreview] = useState(false),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    api('admin/notice')
      .then((d) =>
        setData({
          ...d,
          content: {
            ko: { ...blank(), link: '/poc' },
            en: { ...blank(), link: '/en/poc' },
            ...d.content,
          },
        }),
      )
      .catch((e) => setError(e.message));
  }, []);
  const ko = language === 'ko';
  function change(lang, key, value) {
    setSaved(false);
    setData((d) => ({
      ...d,
      content: { ...d.content, [lang]: { ...d.content[lang], [key]: value } },
    }));
  }
  async function publish() {
    try {
      await api('admin/notice', data);
      setSaved(true);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  if (!data) return <p>{error || 'Loading…'}</p>;
  return (
    <section style={{ display: 'grid', gap: 20 }}>
      <p>
        {ko
          ? '두 언어의 공지를 편집하고 미리 본 후 게시하세요.'
          : 'Edit both languages, preview, then publish.'}
      </p>
      <label>
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) => setData({ ...data, enabled: e.target.checked })}
        />{' '}
        {ko ? '공지 표시' : 'Enable notice'}
      </label>
      {['starts_at', 'ends_at'].map((k) => (
        <label key={k}>
          {k === 'starts_at'
            ? ko
              ? '시작 (현지 시간)'
              : 'Start (local time)'
            : ko
              ? '종료 (현지 시간)'
              : 'End (local time)'}
          <input
            className="ad-in"
            type="datetime-local"
            value={
              data[k]
                ? new Date(
                    new Date(data[k]).getTime() -
                      new Date(data[k]).getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)
                : ''
            }
            onChange={(e) =>
              setData({
                ...data,
                [k]: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
          />
        </label>
      ))}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 24,
        }}
      >
        {['ko', 'en'].map((lang) => (
          <article
            key={lang}
            className="panel"
            style={{ padding: 24, display: 'grid', gap: 12 }}
          >
            <h2>{lang.toUpperCase()}</h2>
            {['label', 'title', 'intro', 'button'].map((key) => (
              <label key={key}>
                {
                  {
                    label: ko ? '라벨' : 'Label',
                    title: ko ? '제목' : 'Title',
                    intro: ko ? '설명' : 'Introduction',
                    button: ko ? '버튼 텍스트' : 'Button text',
                  }[key]
                }
                <textarea
                  className="ad-in"
                  value={data.content[lang][key]}
                  onChange={(e) => change(lang, key, e.target.value)}
                />
              </label>
            ))}
            <label>
              {ko ? '버튼 링크' : 'Button link'}
              <select
                className="ad-in"
                value={data.content[lang].link}
                onChange={(e) => change(lang, 'link', e.target.value)}
              >
                {[
                  '/poc',
                  '/en/poc',
                  '/contact',
                  '/en/contact',
                  '/#ask-chat',
                  '/en#ask-chat',
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            {data.content[lang].rows.map((row, i) => (
              <div key={i} style={{ display: 'grid', gap: 8 }}>
                <input
                  className="ad-in"
                  aria-label={ko ? '항목' : 'Row label'}
                  value={row.label}
                  onChange={(e) =>
                    change(
                      lang,
                      'rows',
                      data.content[lang].rows.map((r, j) =>
                        j === i ? { ...r, label: e.target.value } : r,
                      ),
                    )
                  }
                />
                <input
                  className="ad-in"
                  aria-label={ko ? '값' : 'Row value'}
                  value={row.value}
                  onChange={(e) =>
                    change(
                      lang,
                      'rows',
                      data.content[lang].rows.map((r, j) =>
                        j === i ? { ...r, value: e.target.value } : r,
                      ),
                    )
                  }
                />
                <div>
                  <button
                    className="ad-b"
                    disabled={i === 0}
                    onClick={() => {
                      const rows = [...data.content[lang].rows];
                      [rows[i - 1], rows[i]] = [rows[i], rows[i - 1]];
                      change(lang, 'rows', rows);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    className="ad-b"
                    onClick={() =>
                      change(
                        lang,
                        'rows',
                        data.content[lang].rows.filter((_, j) => j !== i),
                      )
                    }
                  >
                    {ko ? '삭제' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
            <button
              className="ad-b"
              disabled={data.content[lang].rows.length >= 12}
              onClick={() =>
                change(lang, 'rows', [
                  ...data.content[lang].rows,
                  { label: '', value: '' },
                ])
              }
            >
              {ko ? '정보 행 추가' : 'Add information row'}
            </button>
            {preview && (
              <div
                style={{
                  border: '1px solid #D6E6FF',
                  borderRadius: 20,
                  padding: 24,
                }}
              >
                <p>{data.content[lang].label}</p>
                <h2>{data.content[lang].title}</h2>
                <p>{data.content[lang].intro}</p>
                {data.content[lang].rows.map((r, i) => (
                  <p key={i}>
                    {r.label} · {r.value}
                  </p>
                ))}
                <span className="ad-b pri">{data.content[lang].button}</span>
              </div>
            )}
          </article>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button className="ad-b" onClick={() => setPreview(!preview)}>
          {ko ? '미리 보기' : 'Preview'}
        </button>
        <button className="ad-b pri" disabled={!preview} onClick={publish}>
          {ko ? '게시' : 'Publish'}
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      {saved && <p role="status">{ko ? '게시되었습니다.' : 'Published.'}</p>}
    </section>
  );
}
