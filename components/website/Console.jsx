'use client';
import React from 'react';
import { Template as EN } from './reference/Admin_EN.dc.template';
import { Template as KO } from './reference/Admin.dc.template';
import { api, ROOT } from './api';
const names = {
  en: {
    poc: 'PoC requests',
    contact: 'Inquiries',
    interest: 'Store interest',
    logs: 'Activity log',
    admins: 'Admin accounts',
    notice: 'Notice popup',
    new: 'New',
    review: 'In review',
    active: 'Active',
    done: 'Done',
    hold: 'On hold',
    replied: 'Replied',
    all: 'All',
  },
  ko: {
    poc: 'PoC 신청',
    contact: '문의',
    interest: '출시 알림 신청',
    logs: '활동 로그',
    admins: '관리자 계정',
    notice: '공지 팝업',
    new: '신규',
    review: '검토 중',
    active: '진행 중',
    done: '완료',
    hold: '보류',
    replied: '답변 완료',
    all: '전체',
  },
};
export default class Console extends React.Component {
  state = {
    language: 'ko',
    ready: false,
    actor: '',
    tab: 'poc',
    filter: '',
    q: '',
    data: { results: [], counts: {} },
    selected: null,
    logs: [],
    accounts: [],
    idle: 1800,
    modal: null,
    memo: '',
    error: '',
    pocNew: 0,
    ctNew: 0,
    offset: 0,
  };
  async componentDidMount() {
    try {
      const session = await api('admin/session');
      const q = new URLSearchParams(location.search);
      const language = q.get('lang') || session.language;
      if (q.has('lang') && language !== session.language)
        await api('admin/session', {
          language: language === 'en' ? 'en' : 'ko',
        });
      this.deadline = Date.parse(session.expires_at);
      this.setState({
        ready: true,
        actor: session.email,
        language: language === 'en' ? 'en' : 'ko',
      });
      await this.load();
    } catch (e) {
      this.setState({ error: e.message });
    }
    this.timer = setInterval(() => {
      if (this.deadline) {
        const idle = Math.max(
          0,
          Math.ceil((this.deadline - Date.now()) / 1000),
        );
        this.setState({ idle });
        if (!idle) location.assign(ROOT + '/sign-in?expired=1');
      }
    }, 1000);
    this.activity = () => {
      if (
        !this.state.ready ||
        this.state.idle <= 0 ||
        Date.now() - (this.lastTouch || 0) < 60000
      )
        return;
      this.touch();
    };
    document.addEventListener('pointerdown', this.activity);
    document.addEventListener('keydown', this.activity);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    clearTimeout(this.searchTimer);
    document.removeEventListener('pointerdown', this.activity);
    document.removeEventListener('keydown', this.activity);
  }
  async touch() {
    this.lastTouch = Date.now();
    try {
      await api('admin/session', {});
      const r = await api('admin/session');
      this.deadline = Date.parse(r.expires_at);
    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  query() {
    return (
      '?kind=' +
      this.state.tab +
      '&status=' +
      encodeURIComponent(this.state.filter) +
      '&q=' +
      encodeURIComponent(this.state.q) +
      '&offset=' +
      this.state.offset
    );
  }
  async load() {
    const generation = (this.generation || 0) + 1;
    this.generation = generation;
    try {
      const tab = this.state.tab;
      if (['poc', 'contact', 'interest'].includes(tab)) {
        const data = await api('admin/records' + this.query());
        if (this.generation === generation) this.setState({ data, error: '' });
      } else if (tab === 'logs') {
        const logs = await api('admin/logs');
        this.setState({ logs });
      } else if (tab === 'admins') {
        const accounts = await api('admin/accounts');
        this.setState({ accounts });
      }
      const [poc, contact] = await Promise.all([
        api('admin/records?kind=poc'),
        api('admin/records?kind=contact'),
      ]);
      this.setState({ pocNew: poc.unread, ctNew: contact.unread });
    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  go = (tab) =>
    this.setState(
      { tab, filter: '', q: '', selected: null, memo: '', offset: 0 },
      () => this.load(),
    );
  async select(id) {
    try {
      const selected = await api('admin/records/' + id);
      this.setState({ selected, memo: '' });
      await this.load();
    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  async action(data) {
    try {
      await api('admin/records/' + this.state.selected.id, data);
      this.setState({ modal: null, memo: '' });
      if (data.action === 'delete') this.setState({ selected: null });
      else await this.select(this.state.selected.id);
      await this.load();
    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  async signOut(event) {
    event?.preventDefault();
    try {
      await api('admin/session', { action: 'logout' });
    } finally {
      location.assign(ROOT + '/sign-in');
    }
  }
  async export() {
    try {
      const response = await fetch(ROOT + '/api/admin/export' + this.query(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      if (!response.ok) throw new Error('Export failed');
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = 'itrix-submissions.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.setState({ modal: null });
    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  values() {
    const S = this.state,
      t = names[S.language],
      poc = S.tab === 'poc',
      ct = ['contact', 'interest'].includes(S.tab),
      list = poc || ct;
    const statuses = poc
      ? ['new', 'review', 'active', 'done', 'hold']
      : ['new', 'replied', 'hold'];
    const sel = S.selected,
      counts = S.data.counts || {},
      stamp = (x) =>
        x
          ? new Date(x).toLocaleString(S.language === 'ko' ? 'ko-KR' : 'en-GB')
          : '—';
    const rows = (S.data.results || []).map((r) => ({
      ...r,
      id: r.reference,
      d: stamp(r.created_at),
      ind: r.fields.industry,
      when: r.fields.when,
      topic: r.fields.topic,
      msg: r.fields.message,
      st: r.status,
      stl: t[r.status],
      isNew: !r.read_at,
      sel: sel?.id === r.id ? 'sel' : '',
      pick: () => this.select(r.id),
    }));
    const labels = {
      Name: '이름',
      Email: '이메일',
      Company: '회사',
      role: '팀 / 직함',
      phone: '전화번호',
      industry: '산업',
      tools: '사용 도구',
      when: '희망 시작 시기',
      use: '대상 워크로드',
      message: '문의 내용',
      topic: '문의 유형',
      inquiry_route: '접수 경로',
      partnership_type: '협력 유형',
      platform: '플랫폼',
      'Privacy version': '개인정보 처리방침 버전',
      'Privacy consent': '개인정보 수집 동의',
      IP: 'IP 주소',
      Language: '언어',
    };
    const fields = sel
      ? [
          ['Name', sel.name],
          ['Email', sel.email],
          ['Company', sel.company],
          ...Object.entries(sel.fields),
          ['Privacy version', sel.privacy_version],
          ['Privacy consent', stamp(sel.privacy_at)],
          ['IP', sel.ip],
          ['Language', sel.language],
        ]
      : [];
    const s = {
      id: sel?.reference || '',
      date: stamp(sel?.created_at),
      title: sel?.company || sel?.name || '',
      fields: fields.map(([k, v]) => ({
        k: S.language === 'ko' ? labels[k] || k : k,
        v: v || '—',
      })),
      memos: (sel?.notes || []).map((n) => ({
        t: n.text,
        by: n.author,
        at: stamp(n.created_at),
      })),
      mkt: sel?.newsletter_at ? stamp(sel.newsletter_at) : '—',
      mktColor: '#CBD5E1',
      mailto: sel
        ? 'mailto:' +
          encodeURIComponent(sel.email) +
          '?subject=' +
          encodeURIComponent('[itriX] ' + sel.reference)
        : '#',
    };
    const mm =
      String(Math.floor(S.idle / 60)).padStart(2, '0') +
      ':' +
      String(S.idle % 60).padStart(2, '0');
    return {
      language: S.language,
      actor: S.actor,
      isNotice: S.tab === 'notice',
      goNotice: () => this.go('notice'),
      daysLeft: S.data.days_left === null ? '—' : 'D-' + S.data.days_left,
      closeDate:
        S.language === 'ko'
          ? '공지 팝업 종료일 기준'
          : 'Based on the published notice end date',
      pageTitle: t[S.tab],
      isList: list,
      isPoc: poc,
      isCt: ct,
      isLog: S.tab === 'logs',
      isAdm: S.tab === 'admins',
      tabPocCls: poc ? 'on' : '',
      tabCtCls: ct ? 'on' : '',
      tabLogCls: S.tab === 'logs' ? 'on' : '',
      tabAdmCls: S.tab === 'admins' ? 'on' : '',
      goHome: () => this.go('poc'),
      goPoc: () => this.go('poc'),
      goCt: () => this.go('contact'),
      goLog: () => this.go('logs'),
      goAdm: () => this.go('admins'),
      pocNew: S.pocNew,
      ctNew: S.ctNew,
      pocNewZ: S.pocNew ? '' : 'z',
      ctNewZ: S.ctNew ? '' : 'z',
      idle: mm,
      q: S.q,
      onQ: (e) => {
        this.setState({ q: e.target.value, offset: 0, selected: null });
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.load(), 250);
      },
      k1: S.data.unread || 0,
      k1s: S.language === 'ko' ? '읽지 않은 신청' : 'Unread submissions',
      k2l: poc ? t.review + ' · ' + t.active : t.replied,
      k2:
        (counts[poc ? 'review' : 'replied'] || 0) +
        (poc ? counts.active || 0 : 0),
      k2s: '',
      k3: S.data.this_month || 0,
      k3l: S.language === 'ko' ? '이번 달 접수' : 'Received this month',
      k3s: new Date().toLocaleDateString(
        S.language === 'ko' ? 'ko-KR' : 'en-GB',
        { month: 'long', year: 'numeric' },
      ),
      filters: ['', ...statuses].map((k) => ({
        label: t[k || 'all'],
        n: k
          ? counts[k] || 0
          : Object.values(counts).reduce((a, b) => a + b, 0),
        cls: S.filter === k ? 'on' : '',
        on: () =>
          this.setState({ filter: k, offset: 0, selected: null }, () =>
            this.load(),
          ),
      })),
      rows,
      isEmptyRows: rows.length === 0,
      hasSel: !!sel,
      s,
      stBtns: statuses.map((k) => ({
        label: t[k],
        cls: sel?.status === k ? 'on' : '',
        on: () => sel && this.action({ action: 'status', status: k }),
      })),
      closeSel: () => this.setState({ selected: null }),
      memo: S.memo,
      onMemo: (e) => this.setState({ memo: e.target.value }),
      addMemo: () => this.action({ action: 'note', text: S.memo }),
      openExport: () => this.setState({ modal: 'export' }),
      openDelete: () => this.setState({ modal: 'delete' }),
      closeModal: () => this.setState({ modal: null }),
      showExport: S.modal === 'export',
      showDelete: S.modal === 'delete',
      exportN: S.data.total || 0,
      doExport: () => this.export(),
      doDelete: () => this.action({ action: 'delete', confirm: true }),
      hasToast: !!S.error,
      toast: S.error,
      showWarn: S.idle > 0 && S.idle <= 60,
      showSessExpired: S.idle <= 0,
      warnLeft: mm,
      keepAlive: () => this.touch(),
      goRelogin: () => location.assign(ROOT + '/sign-in?expired=1'),
      signOut: (e) => this.signOut(e),
      logs: S.logs.map((l) => ({
        at: stamp(l.created_at),
        by: l.actor,
        act: l.action,
        target: l.target,
        ip: l.ip || '—',
      })),
      admins: S.accounts.map((a) => ({
        email: a.email,
        role: S.language === 'ko' ? '관리자' : 'Administrator',
        last: stamp(a.last_login),
        canRemove: false,
      })),
    };
  }
  render() {
    const S = this.state,
      T = S.language === 'en' ? EN : KO;
    return (
      <>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Saira+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
        {!S.ready ? (
          <p role="status" style={{ padding: 40 }}>
            {S.error || 'Loading…'}
          </p>
        ) : (
          <>
            <T {...this.values()} />
            {['poc', 'contact', 'interest'].includes(S.tab) && (
              <div
                style={{
                  position: 'fixed',
                  bottom: 12,
                  left: 260,
                  display: 'flex',
                  gap: 16,
                  background: '#080D10',
                  padding: 12,
                  color: '#F8FAFC',
                }}
              >
                <button
                  onClick={() =>
                    this.go(S.tab === 'interest' ? 'contact' : 'interest')
                  }
                >
                  {S.language === 'ko'
                    ? '출시 알림 신청 / 문의'
                    : 'Store interest / inquiries'}
                </button>
                <button
                  disabled={!S.offset}
                  onClick={() =>
                    this.setState({ offset: Math.max(0, S.offset - 100) }, () =>
                      this.load(),
                    )
                  }
                >
                  ←
                </button>
                <span>
                  {S.data.total ? S.offset + 1 : 0}–
                  {S.offset + (S.data.results || []).length} /{' '}
                  {S.data.total || 0}
                </span>
                <button
                  disabled={S.offset + 100 >= S.data.total}
                  onClick={() =>
                    this.setState({ offset: S.offset + 100 }, () => this.load())
                  }
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </>
    );
  }
}
