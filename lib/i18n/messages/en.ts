/**
 * English copy. The source of truth.
 *
 * Shape rules, so this stays maintainable as it grows:
 *
 *   - Group by surface (`nav`, `settings`, `palette`), not by page component.
 *     Two pages showing the same word share one key.
 *   - Interpolation is a plain function (`count: (n) => ...`), not an ICU
 *     template. TypeScript then checks the call site's arity and types, which
 *     a `{count}` placeholder in a string cannot.
 *   - Brand and protected identifiers are NEVER translated: itriX, ALPHA
 *     Compute, ALPHA Core, NDA, PoC, KPI, KST. They appear verbatim in both
 *     locales. (Surface 1 states this rule in `siteLocale.ts`; it is the same
 *     rule here.)
 *   - Staff language, not spec language — the terminology principle the
 *     console was rebuilt on. "Deal signals", not "cockpit"; "Risk level",
 *     not "claim level"; "Buyer profiles", not "personas". Translate the
 *     staff word, never the spec word underneath it.
 *
 * `Messages` is derived from this object, and `ko.ts` is annotated with it —
 * so a key added here fails the Korean build until it is translated. That
 * type annotation is the only translation-coverage check this stack has;
 * Surface 1 casts it away with `as CommonCopy` and silently ships
 * `undefined`. Do not do that here.
 */

export const en = {
  app: {
    name: 'itriX',
    tagline: 'Staff console',
  },

  nav: {
    today: 'Today',
    leads: 'Prospective Customers',
    conversations: 'Conversations',
    approvals: 'Message Approvals',
    customers: 'Confirmed Customers',
    insights: 'Insights',
    library: 'Library',
    settings: 'Settings',
    /** Sidebar group heading above Settings. */
    account: 'Account',
    /** Fallback group heading in the command palette. */
    navigate: 'Navigate',
    signOut: 'Sign out',
  },

  common: {
    loading: 'Loading',
    accessDenied: 'Access denied',
    accessDeniedBody: 'You do not have permission to view this page.',
    goHome: 'Go home',
    tryAgain: 'Try again',
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search',
  },

  palette: {
    title: 'Command palette',
    /** The button in the header that opens the palette. */
    trigger: 'Search…',
    placeholder: 'Type a command or destination…',
    /** Instructions announced to screen readers when the dialog opens. */
    instructions: 'Type to filter commands, arrow keys to choose, Enter to run.',
    inputLabel: 'Search commands',
    listLabel: 'Commands',
    /** Heading above the remembered selections, shown on an empty query. */
    recent: 'Recent',
    nothingMatches: (query: string) => `Nothing matches “${query}”.`,
    groupAppearance: 'Appearance',
    groupSession: 'Session',
    themeLight: 'Theme: Light',
    themeDark: 'Theme: Dark',
    themeSystem: 'Theme: System',
    /** Matched against the query as well as the label, so both locales search. */
    themeKeywords: 'theme dark light mode appearance',
    signOutKeywords: 'logout sign out session',
    languageEnglish: 'Language: English',
    languageKorean: 'Language: 한국어',
    languageKeywords: 'language locale korean english 언어 한국어 영어',
  },

  auth: {
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    email: 'Email',
    password: 'Password',
    demoSignIn: 'One-click demo sign-in',
    /** Shown only in demo mode; the credentials render as <code> nodes around it. */
    demoIntro: 'Demo mode — sign in with',
    demoOutro:
      '. A wrong password shows the real error flow (a 401, deliberately without saying which field was wrong).',
    lockedOut:
      'Locked out? Ask an admin to reset your account — staff accounts are provisioned, not self-served.',
  },

  settings: {
    profile: 'Profile',
    profileDescription: 'Your name and account details.',
    team: 'Team',
    teamDescription: 'Who has staff access, and their load.',
    appearance: 'Appearance',
    appearanceDescription: 'Theme, language and display preferences.',
    /** Accessible name for the settings sub-navigation. */
    sectionsLabel: 'Settings sections',
  },

  appearance: {
    themeTitle: 'Theme',
    themeDescription:
      'Applies immediately and persists in this browser. “System” tracks your OS setting as it changes.',
    system: 'System',
    systemHint: 'Follows your OS preference, live.',
    light: 'Light',
    lightHint: 'Always light, everywhere.',
    dark: 'Dark',
    darkHint: 'Always dark, everywhere.',

    languageTitle: 'Language',
    languageDescription:
      'Applies immediately across the console. Times stay on the KST operating clock in both languages.',
    /** Screen-reader legend for the radio group. */
    languageLegend: 'Language',
    englishHint: 'The source language. Every screen is written here first.',

    /**
     * Toggle accessible names. Both state the CURRENT value and what pressing
     * will do — "Theme: dark" alone leaves a screen-reader user guessing.
     */
    themeToggle: (current: string, next: string) => `Theme: ${current}. Switch to ${next}.`,
    themeToggleTitle: (current: string, next: string) => `Theme: ${current} — switch to ${next}`,
    languageToggle: (current: string, next: string) => `Language: ${current}. Switch to ${next}.`,
    languageToggleTitle: (current: string, next: string) => `Language: ${current} — switch to ${next}`,
    koreanHint: 'A full translation. Product and brand names stay in English.',
  },

  /**
   * Vocabulary shared by Today, Leads and Approvals.
   *
   * `leadStatus` maps the BACKEND's literal wire values ('Meeting Booked')
   * onto display text. The wire values are not translated and must not be —
   * `LeadStatus` in lib/today/types.ts is the API contract. This is the one
   * place the two vocabularies meet.
   */
  status: {
    riskLabel: (level: number) =>
      ({
        1: 'Risk 1 · conversational',
        2: 'Risk 2 · qualitative',
        3: 'Risk 3 · needs citation',
        4: 'Risk 4 · commercial',
        5: 'Risk 5 · legal',
      })[level] ?? `Risk ${level}`,
    leadStatus: (value: string) =>
      ({
        New: 'New',
        Contacted: 'Contacted',
        'Meeting Booked': 'Meeting booked',
        NDA: 'NDA',
        Evaluation: 'Evaluation',
        PoC: 'PoC',
        Licensed: 'Licensed',
        Closed: 'Closed',
        Qualifying: 'Qualifying',
        Nurture: 'Nurture',
        Negotiation: 'Negotiation',
        Lost: 'Lost',
      })[value] ?? value,
    unassigned: 'unassigned',
    /**
     * Journey state → staff language. Wire values are the spec's ladder codes
     * (apps/journey/models.py); staff should never have to parse NDA_REVIEW.
     * Unknown values fall through untranslated, so a new backend state
     * degrades to visible-but-raw rather than to blank.
     */
    journeyLabel: (state: string) =>
      ({
        ARRIVED: 'Just arrived',
        IN_REVIEW: 'In conversation',
        DIAGNOSED: 'Problem diagnosed',
        CLIENT_PAGE: 'Viewing their page',
        INVITED: 'Invited to an account',
        NDA_REVIEW: 'NDA stage',
        ASSESSMENT: 'Evaluating',
        POC: 'Running a PoC',
        INTEGRATION: 'Integrating',
        CUSTOMER_SUCCESS: 'Customer',
        DORMANT: 'Dormant',
        CLIENT: 'Customer',
        ENGAGED: 'In conversation',
      })[state] ?? state,

    /**
     * How a conversation stands, for a row. Unknown values fall through raw for the
     * same reason journeyLabel does: a new backend value should be visible, not blank.
     */
    relationshipLabel: (state: string) =>
      ({
        visitor: 'Visitor',
        technical_evaluator: 'Technical evaluator',
        customer: 'Customer',
        strategic_customer: 'Strategic customer',
      })[state] ?? state,

    /**
     * The six-part reflection. This is the one that gates what the assistant may
     * recommend, so a row that hides it hides the reason a conversation is stuck.
     */
    mirrorLabel: (state: string) =>
      ({
        not_required: 'No reflection yet',
        pending: 'Reflection pending',
        confirmed: 'Reflection confirmed',
        refine: 'Being corrected',
        restart: 'Restarted',
        skipped: 'Reflection skipped',
        fallback: 'Reflection unavailable',
      })[state] ?? state,
  },

  today: {
    title: 'Today',
    subtitle: (firstName: string | null) =>
      firstName
        ? `${firstName} — what needs your attention now, most urgent first.`
        : 'What needs your attention now, most urgent first.',
    scopeLabel: 'Whose work to show',
    scopeMine: 'Mine + unassigned',
    scopeAll: 'Everyone',
    loading: 'Loading…',
    showMore: (shown: number, hidden: number) => `Show ${shown} more (${hidden} hidden)`,
    atLeastChars: (n: number) => `At least ${n} characters`,

    chipApprovals: 'Approvals',
    chipOverdue: 'Overdue',
    chipWaiting: 'Waiting',
    chipNewLeads: 'New leads',
    chipNdas: 'NDAs',
    chipDueToday: 'Due today',
    chipSupport: 'Support',
    chipFiles: 'Files',

    approvalsTitle: 'Waiting for your OK',
    approvalsHint: "messages the AI won't send without a human",
    approvalsEmpty: 'Nothing waiting — the AI has no held drafts right now.',
    needsOk: 'Needs an OK',
    needsSecondOk: 'Needs a second OK',
    firstOkBy: (name: string) => `(first OK: ${name})`,
    approve: 'Approve',
    giveSecondOk: 'Give second OK',
    reject: 'Reject',
    rejectPlaceholder: "Why this can't go out",
    approvedToast: 'Approved',
    secondOkToast: 'Second OK given',
    rejectedToast: 'Rejected',

    filesTitle: 'Files awaiting review',
    filesHint: 'quarantined or failed scans — oldest first',
    release: 'Release',
    quarantine: 'Quarantine',
    fileReleasedToast: 'File released',
    fileQuarantinedToast: 'File quarantined',

    overdueTitle: 'Overdue follow-ups',
    overdueHint: 'oldest first — these slipped',
    dueTodayTitle: 'Due today',
    dueTodayHint: 'still ahead of you today',
    followUpFallback: 'Follow up',
    due: 'due',
    done: 'Done',
    snooze24h: 'Snooze 24h',
    dismiss: 'Dismiss',
    doneToast: 'Done',
    snoozedToast: 'Snoozed 24h',
    dismissedToast: 'Dismissed',

    newLeadsTitle: 'New leads',
    newLeadsHint: 'unworked — highest priority first',
    newEnquiry: 'New enquiry',
    leadFallback: 'Lead',
    claimedToast: (company: string) => `${company} is yours`,

    ndaTitle: 'NDAs in flight',
    ndaHint: 'to send, or waiting on a signature',

    supportTitle: 'Open support requests',
    supportHint: 'handled outside this screen for now — read-only heads-up',

    threadsTitle: 'Conversations probably waiting',
    threadsHint: 'visitor engaged in the last 24h — worth a look',
    untitledConversation: 'Untitled conversation',
    // English pluralises, Korean does not — the count is a parameter so each
    // locale decides for itself rather than the component guessing.
    visitorTurns: (n: number) => `${n} visitor ${n === 1 ? 'turn' : 'turns'}`,
    lastActivity: 'last activity',
  },

  leads: {
    title: 'Prospective Customers (In Discussion)',
    subtitle: 'Every lead in one place — filter the list, or see the funnel as a board.',
    viewList: 'List',
    viewBoard: 'Board',
    searchPlaceholder: 'Search company, name, pain…',
    filterMine: 'Mine',
    filterKnown: 'Known',
    filterUnknown: 'Unknown',

    colCompany: 'Company / contact',
    colPriority: 'Priority',
    colStage: 'Stage',
    colScore: 'Score',
    colOwner: 'Owner',
    colSubmitted: 'Submitted',
    selectAll: 'Select all on this page',
    unknownLead: 'Unknown',
    unowned: 'unowned',
    overdue: 'overdue',
    loading: 'Loading…',

    selectedCount: (n: number) => `${n} selected`,
    assignToMe: 'Assign to me',
    assignTo: 'Assign to',
    someonePlaceholder: 'someone…',
    memberOpenLeads: (name: string, open: number) => `${name} (${open} open)`,
    moveTo: 'Move to',
    stagePlaceholder: 'stage…',
    apply: 'Apply',
    working: 'Working…',
    clear: 'Clear',
    /** Bulk-action toasts. `verb` is already localized by the caller. */
    bulkDone: (verb: string, done: number) => `${verb} ${done} lead${done === 1 ? '' : 's'}`,
    bulkPartial: (verb: string, done: number, failed: number) =>
      `${verb} ${done}, ${failed} failed`,
    verbAssigned: 'Assigned',
    verbMoved: 'Moved',
    verbAssignedTo: (name: string) => `Assigned to ${name} —`,

    reassign: 'Reassign',
    assign: 'Assign',
    takeItMyself: 'Take it myself',
    putBackInQueue: 'Put back in the queue',
    thisLeadIsYours: 'This lead is yours',
    backInQueue: 'Back in the unassigned queue',

    companyTitle: 'Company',
    unknownContact: 'Unknown contact',
    companyNotGiven: 'Company not given',
    unnamed: 'Unnamed',
    rowIndustry: 'Industry',
    rowContact: 'Contact',
    rowEmail: 'Email',
    rowFirstSeen: 'First seen',
    emailAddress: 'email address',
    notSharedYet: 'Not shared yet',

    unknownLeadTitle: 'Unknown lead',
    notFound: 'Lead not found.',
    backToAll: 'Back to all leads.',

    dealSignals: 'Deal signals',
    unavailable: 'Unavailable.',
    suggestedNextStep: 'Suggested next step',
    ndaReadiness: 'NDA readiness',
    evaluationReadiness: 'Evaluation readiness',
    pocReadiness: 'PoC readiness',
    licenseOutLikelihood: 'License-out likelihood',
    watchFor: 'Watch for',
    theirProblemLabel: 'Their problem:',

    ndaTitle: 'NDA',
    noNdaYet: 'No NDA yet.',
    ndaRequested: 'NDA requested',
    ndaSent: 'NDA sent',
    signerEmail: "Signer's email",
    markedSigned: 'Marked signed',
    markDeclined: 'Mark declined',
    declineReason: 'Their stated reason',
    markedDeclined: 'Marked declined',
    signedOn: 'Signed',
    requestNda: 'Request NDA',
    markSigned: 'Mark signed',
    noConversationsYet:
      "Nothing linked to this lead yet — a conversation attaches once the visitor's thread is qualified.",
    browseAllConversations: 'Browse all conversations',

    aboutThisLead: 'About this lead',
    fIndustry: 'Industry',
    fTheirProblem: 'Their problem',
    fComputeBottleneck: 'Compute bottleneck',
    fWorkload: 'Workload',
    fCurrentStack: 'Current stack',
    fCommercialIntent: 'Commercial intent',
    fTimeline: 'Timeline',
    fProductRoute: 'Product route',
    fCommercialPath: 'Commercial path',
    fSpecialRights: 'Special rights',
    fScoreBreakdown: 'Score breakdown',
    fEngagement: 'Engagement',
    fSystemSuggestion: 'System suggestion',

    untitledConversation: 'Untitled conversation',
    messagesFallback: 'Messages',
    notesTitle: 'Notes',
    addNotePlaceholder: 'Add a note…',
    noNotesYet: 'No notes yet.',
    historyTitle: 'History',
    nothingYet: 'Nothing yet.',
    allLeads: 'All leads',
    stage: 'Stage',
    movedTo: (stage: string) => `Moved to ${stage}`,
    scoreLine: (tier: number, score: number) => `P${tier} · score ${score} · submitted`,
    conversationsTitle: (n: number) => (n > 1 ? `Conversations (${n})` : 'Conversations'),
    addNote: 'Add',
    documentsViewed: (n: number) => `${n} document${n === 1 ? '' : 's'} viewed`,
    clickedCta: 'clicked the call-to-action',
    askedForHuman: 'asked for a human',
    valueDelivered: 'value delivered',
  },

  conversations: {
    title: 'Conversations',
    /**
     * Cumulative age windows, newest first: each tab includes everything in
     * the tabs to its left, so counts only ever grow rightwards. 'Ongoing'
     * is the live band (touched within the hour).
     */
    tabOngoing: 'Ongoing',
    tab24h: '24 hrs',
    tab3d: '3 days',
    tab1w: '1 week',
    tab1m: '1 month',
    tabAll: 'All',
    searchPlaceholder: 'Search title or company…',
    noMatch: 'Nothing matches the search here.',
    emptyTab: 'Nothing in this tab right now.',
    anonymousVisitors: 'Anonymous visitors',
    anonymousVisitor: 'Anonymous visitor',
    untitled: 'Untitled conversation',
    /** Prefixes the LEAD's stage on thread detail so it cannot be read as the thread's. */
    leadStandingPrefix: 'lead:',
    messagesFallback: 'Messages',
    /** Browser tab titles. */
    transcriptTitle: 'Transcript',
    accountTitle: 'Account',
    subtitle: 'Watch the AI talk to visitors, live — open a transcript to read and reply.',
    conversationCount: (n: number) => `${n} conversation${n === 1 ? '' : 's'}`,
    identityUnknown: 'identity unknown until they qualify',
    turnSummary: (turns: number, visitorTurns: number) =>
      `${turns} turns (${visitorTurns} from the visitor)`,
    replyPlaceholder: 'Reply as a person…',
    riskAriaLabel: 'Risk level of this message',
    send: 'Send',
    sendForOk: 'Send for OK',
    sending: 'Sending…',
    sentToast: 'Sent',
    heldToast: 'Held for an OK — it will send once approved',
    /** Composer risk options spell out the consequence; the queue labels do not. */
    riskOption: (level: number) =>
      ({
        1: 'Risk 1 · conversational',
        2: 'Risk 2 · qualitative',
        3: 'Risk 3 · needs citation (held for OK)',
        4: 'Risk 4 · commercial (held, 2 OKs)',
        5: 'Risk 5 · legal (held, 2 OKs)',
      })[level] ?? `Risk ${level}`,
    senderTeam: 'Team',
    senderAi: 'AI',
    senderVisitor: 'Visitor',
    senderCustomer: 'Customer',
    senderSystem: 'System',
    heldForOk: 'held for OK',
    blocked: 'blocked',
    blockedByGuard: 'Blocked by the language guard — rephrase and try again',
  },

  approvals: {
    title: 'Message Approvals',
    subtitle: 'Messages the AI wants to send that need a human OK before they go out.',
    watchOnly: ' Your role can watch this queue but not act on it.',
    riskAtLeast: (level: number) => `Risk ${level}+`,
    oldestFirst: 'Oldest first',
    newestFirst: 'Newest first',
    loading: 'Loading…',
    draftUpdated: 'Draft updated — still needs its OK',
    approvedToast: 'Approved',
    secondOkToast: 'Second OK given — sending',
    rejectedToast: 'Rejected',
    firstOkBy: (name: string) => `first OK: ${name}`,
    editFirst: 'Edit first',
    saveEdit: 'Save edit',
  },

  customers: {
    title: 'Confirmed Customers',
    subtitle: 'Licensed accounts by health, and every deal still in flight.',
    searchPlaceholder: 'Search company…',
    tabAccounts: (n: number) => `Accounts ${n}`,
    tabDeals: (n: number) => `Deals in flight ${n}`,
    healthCritical: 'Critical',
    healthAtRisk: 'At risk',
    healthUnknown: 'Unknown',
    healthStable: 'Stable',
    colCompany: 'Company',
    colHealth: 'Health',
    colType: 'Type',
    colScope: 'Scope',
    colStatus: 'Status',
    colUpdated: 'Updated',
    colDetails: 'Details',
    colWhy: 'Why',
    colFlags: 'Flags',
    colExpansion: 'Expansion',
    flagBlockingSupport: 'blocking support',
    flagOffPlan: (n: number) => `${n} off-plan`,
    flagDegraded: (n: number) => `${n} degraded`,
    expansionAllowedShort: 'allowed',
    expansionOnHoldShort: 'on hold',
    nounAccounts: 'accounts',
    nounDeals: 'deals',
    resultPlaceholder: 'result',
    advanceHint: 'Click to advance: pending, in progress, done',
    cappedNote: 'Showing the worst 500 accounts — the backend has no paging beyond that yet.',
    notFound: 'Account not found.',
    backToCustomers: 'Back to customers.',
    whyThisHealth: 'Why this health',
    noFlags: 'No flags — nothing is dragging this account down.',
    outcomesOffPlan: (n: number) => `${n} outcome(s) off plan`,
    degradedDeployments: (n: number) => `${n} degraded deployment(s)`,
    negativePulse: 'negative pulse',
    expansionAllowed: 'expansion allowed',
    expansionOnHold: 'expansion on hold',
    supportRequests: 'Support requests',
    supportReadOnly: '— read-only here; handled outside the dashboard for now',
    noSupportRequests: 'No support requests.',
    blocking: 'blocking',
    pastResponseWindow: 'past its response window',
    unowned: 'unowned',
    opened: 'opened',
    portalNote:
      "Outcome tracking, success plans, and the relationship team live in the customer's own portal and aren't exposed to staff accounts yet.",
    loading: 'Loading…',
  },

  insights: {
    title: 'Insights',
    subtitle: "How we're doing — the numbers that matter.",
    loading: 'Loading…',
    unavailable: 'Analytics unavailable.',
    newLeads: 'New leads',
    lastDays: (days: number) => `last ${days} days`,
    priority1: 'Priority 1',
    strategicInPlay: 'strategic leads in play',
    priority2: 'Priority 2',
    overdueFollowUps: 'Overdue follow-ups',
    rightNow: 'right now',
    funnelTitle: 'Funnel — how far leads get',
    responseTimeTitle: 'Response time — priority 1 and 2 only',
    p1Average: 'P1 average',
    p2Average: 'P2 average',
    overTheBar: (n: number) => `${n} over the bar`,
    byProductRoute: 'By product route',
    byIndustry: 'By industry',
    whatLeadsSay: 'What leads keep saying',
    unknown: 'Unknown',
    hours: (n: number) => `${n}h`,
    rangeDays: (n: number) => `${n} days`,
    carryOn: (percent: string) => `${percent}% carry on`,
    answeredInside: 'answered inside the response window',
    submissionsTitle: (days: number) => `Submissions — last ${days} days`,
    /**
     * Funnel stage → display text. Like `status.leadStatus`, the argument is
     * the backend's own label; unknown stages fall through untranslated.
     */
    funnelStage: (value: string) =>
      ({
        Submitted: 'Submitted',
        Contacted: 'Contacted',
        'Meeting / NDA': 'Meeting / NDA',
        'Evaluation / PoC': 'Evaluation / PoC',
        Licensed: 'Licensed',
      })[value] ?? value,
  },

  library: {
    title: 'Library',
    subtitle: "The reference shelf: reusable wording and who we're selling to.",
    tabTemplates: 'Message templates',
    tabProfiles: 'Buyer profiles',
    kindEmail: 'Email',
    kindFollowUp: 'Follow-up',
    kindEvaluation: 'Evaluation',
    kindPoc: 'PoC',
    kindHandoff: 'Handoff',
    searchTemplates: 'Search templates…',
    newTemplate: 'New template',
    close: 'Close',
    edit: 'Edit',
    templateName: 'Template name',
    templateBody: 'Body — use {{variables}} for the parts that change per lead',
    templateSaved: 'Template saved',
    templateCreated: 'Template created',
    noTemplatesMatch: 'No templates match the search.',
    noTemplatesOfKind: (kind: string) => `No ${kind} templates yet.`,
    internalOnly:
      'Internal only — buyer profiles must never be shared with or shown to customers.',
    searchProfiles: 'Search company, role, family…',
    noProfilesMatch: 'No profiles match the search.',
    noProfilesSeeded: 'No profiles seeded yet.',
    colCompany: 'Company',
    colPriority: 'Priority',
    pWhatTheyCareAbout: 'What they care about',
    pTheirMandate: 'Their mandate',
    pWhatSetsThemOff: 'What sets them off',
    pWhatTheyWant: 'What they want',
    pLikelyChampion: 'Likely champion',
    pLikelyBlocker: 'Likely blocker',
    pLikelyObjection: 'Likely objection',
    pHowToAnswerIt: 'How to answer it',
    colName: 'Name',
    colFillsIn: 'Fills in',
    colUpdated: 'Updated',
    nounTemplates: 'templates',
    nounProfiles: 'profiles',
  },

  ui: {
    toggleSidebar: 'Toggle sidebar',
    notifications: 'Notifications',
    notificationsUnread: (n: number) => `Notifications, ${n} unread`,
    markAllRead: 'Mark all read',
    dismissNotification: 'Dismiss notification',
    loading: 'Loading…',
    /** "Showing 1–20 of 137 leads" — one string so word order can change. */
    showingRange: (from: number, to: number, total: number, noun: string) =>
      `Showing ${from}–${to} of ${total} ${noun}`,
    perPage: 'Per page',
    previous: 'Previous',
    next: 'Next',
    /** The viewer's own zone, shown beside the operating clock when they differ. */
    youAt: (time: string, zone: string) => `you ${time} (${zone})`,
  },

  profile: {
    title: 'Profile',
    description: (email: string) =>
      `Signed in as ${email}. Name changes apply everywhere your account appears.`,
    name: 'Name',
    saveChanges: 'Save changes',
    saving: 'Saving…',
    updated: 'Profile updated.',
  },

  team: {
    title: 'Team',
    description:
      "Everyone with staff access. Accounts are provisioned by an admin — there's no self-serve invite.",
    searchPlaceholder: 'Search name or email…',
    openLeads: (n: number) => `${n} open`,
    inactive: 'inactive',
    loading: 'Loading…',
  },

  errors: {
    somethingWentWrong: 'Something went wrong',
    /**
     * Split rather than interpolated: the digest renders inside a <code>
     * element, so the sentence has to break around a React node.
     */
    unexpectedError: 'The page hit an unexpected error. It has been logged',
    reference: 'reference',
    notFoundTitle: 'Page not found',
    notFoundBody: 'The address may be mistyped, or the page may have moved.',
  },
};

export type Messages = typeof en;
