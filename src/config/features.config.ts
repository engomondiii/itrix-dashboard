/**
 * Surface 2 v5.0 feature flags.
 *
 * Each phase of the v5.0 plan is independently shippable behind its flags so
 * the live CRM keeps running throughout. With every flag off, the dashboard is
 * the shipped v3.0 CRM plus the unflagged corrections (fail-closed mock mode
 * and the Brand Manual v1.5 token rename), which are corrections rather than
 * features and therefore ship unconditionally.
 *
 * DEFAULT-ON, UNLIKE MOCK MODE — and the difference is deliberate.
 *
 * `useMocks` is opt-in by the exact string "true" because it is a SECURITY
 * boundary: forgetting it must fail closed. These are not. All three phases are
 * merged, every view degrades honestly when its backend route is missing (see
 * `notImplementedOnBackend`), and the failure mode of forgetting one is only
 * that an operator cannot reach a page that would have told them the truth
 * anyway. Defaulting them off meant a deployment with no env vars pruned the
 * new areas out of the sidebar entirely, which is how they went missing in
 * production.
 *
 * So: enabled unless explicitly set to "false". Set the variable to "false" to
 * hide an area — for example while its backend counterpart is being built and
 * the empty state would only confuse people.
 *
 * BUILD-TIME, NOT RUNTIME. `NEXT_PUBLIC_*` is inlined by the compiler, so every
 * value here is frozen at `next build`. The reads below are written as full
 * literal `process.env.NEXT_PUBLIC_…` expressions on purpose: Next only
 * substitutes statically-analysable member accesses, so a computed lookup like
 * `process.env[name]` would silently evaluate to undefined in the browser.
 *
 * ORDERING RULE (Architecture v2.6 Appendix B.1). A frontend flag may only be
 * enabled once its backend counterpart is on. Showing an attachment review
 * queue against a backend without `ENABLE_ATTACHMENTS` presents controls that
 * cannot succeed, which is worse than not offering them.
 *
 * Surface 2 v5.0 §06, §10
 */

/** On unless explicitly disabled. See the default-on note above. */
const on = (value: string | undefined): boolean => value !== "false";

export const features = {
  /** Phase 1 — live conversation oversight: the Threads board and transcript. */
  threadOversight: on(process.env.NEXT_PUBLIC_ENABLE_THREAD_OVERSIGHT),

  /** Phase 2 — customer health board, per-customer read, success reviews. */
  customerSuccess: on(process.env.NEXT_PUBLIC_ENABLE_CUSTOMER_SUCCESS),

  /** Phase 2 — attachment review queue, scan status, quarantine and release. */
  attachmentReview: on(process.env.NEXT_PUBLIC_ENABLE_ATTACHMENT_REVIEW),

  /** Phase 2 — coverage map and question-loop audit in the cockpit. */
  coverageReading: on(process.env.NEXT_PUBLIC_ENABLE_COVERAGE_READING),

  /** Phase 3 — customer-first NBA surfacing with suppression reasons. */
  customerFirstNba: on(process.env.NEXT_PUBLIC_ENABLE_CUSTOMER_FIRST_NBA),

  /** Phase 3 — blocking-approval banner and stream-guard reporting. */
  streamingApproval: on(process.env.NEXT_PUBLIC_ENABLE_STREAMING_APPROVAL),
} as const;

export type Features = typeof features;
export type FeatureKey = keyof Features;
