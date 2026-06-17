import { LEAD_STATUSES } from "@/constants/statuses";
import { PRODUCT_ROUTES, LICENSE_PATHS, SPECIAL_RIGHTS } from "@/constants/products";
import { tierFromScore } from "@/constants/tiers";
import { SCORING_CATEGORIES } from "@/constants/scoring";
import { MOCK_TEAM } from "@/mocks/users";
import type { Lead, ScoreBreakdown } from "@/types/lead";

/** Deterministic PRNG (mulberry32) so server + client render identical mocks. */
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INDUSTRIES = [
  "Semiconductor / AI chip",
  "Cloud / hyperscaler / data center",
  "HPC / CAE / simulation",
  "AI infrastructure / compiler / runtime",
  "Energy / infrastructure",
  "Robotics / edge AI",
  "Investment / corporate development",
  "Research / public institution",
];

const COMPANIES = [
  "Helion Silicon", "NimbusScale", "Aerodyne CAE", "Kernighan Labs", "Voltaire Grid",
  "Synapse Robotics", "Meridian Ventures", "KAIST CCL", "Pascal Systems", "Tonghae Cloud",
  "Fermi Compute", "BlueShift HPC", "Cixi Semiconductors", "Northwind Energy", "Atlas Foundry",
  "Quanta Dynamics", "Onnuri AI", "Cerebra Edge", "Halcyon Data", "Granite Simulation",
];

const ROLES = [
  "CEO / Founder / Executive", "CTO / Chief Scientist", "Strategy / Corporate Development",
  "Product / Platform Owner", "Engineering / Runtime / SDK", "Solver / Simulation Team",
  "Investor", "Researcher",
];

const PAINS = ["Speed", "Energy", "Memory", "Accuracy", "Reproducibility", "Hardware independence", "Software stack differentiation"];
const WORKLOADS = [
  "Complex-valued linear algebra", "Tensor / high-dimensional algebra", "Conservation-law simulation",
  "AI inference / training infrastructure", "Scientific simulation", "Semiconductor process simulation",
  "Runtime / compiler pipeline", "Edge / robotics workload",
];
const STACKS = ["CPU", "GPU", "NPU / TPU", "FPGA / ASIC", "CUDA / ROCm / oneAPI", "BLAS / LAPACK", "PyTorch / JAX / TensorFlow", "Proprietary solver", "Cloud infrastructure"];
const INTENTS = ["Learning about iTrix", "Confidential evaluation", "Paid PoC", "SDK / runtime integration", "Field-of-use licensing", "Strategic investment", "Acquisition / partnership"];
const TIMELINES = ["Immediately", "Within 3 months", "Within 6 months", "Within 12 months", "Long-term research"];

const BOTTLENECKS = [
  "AI inference cost is rising; GPU-hour spend nearly doubled in six months.",
  "Conservation-law simulation loses accuracy over long time runs.",
  "Energy and cooling are capping AI expansion; need better compute density.",
  "Chip needs a stronger software stack to differentiate on real workloads.",
  "Complex-valued computation is inefficient on real hardware.",
  "Memory movement dominates runtime in the inference path.",
  "Solver runtime and reproducibility are blocking a production rollout.",
  "Edge device can't fit the workload within power and latency limits.",
];

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

function breakdownFor(r: () => number, score: number): ScoreBreakdown {
  // Distribute the total score across categories within their weights.
  const weights = [25, 25, 20, 15, 15];
  const raw = weights.map((w) => r() * w);
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const scaled = raw.map((v) => (v / sum) * score);
  const out = {} as ScoreBreakdown;
  SCORING_CATEGORIES.forEach((cat, i) => {
    out[cat] = Math.round(scaled[i]);
  });
  return out;
}

function generate(): Lead[] {
  const r = rng(42);
  const now = Date.now();
  const leads: Lead[] = [];

  for (let i = 0; i < 48; i++) {
    const score = Math.floor(20 + r() * 78); // 20–98
    const tier = tierFromScore(score);
    const industry = pick(r, INDUSTRIES);
    const company = COMPANIES[i % COMPANIES.length];
    const productRoute = pick(r, [...PRODUCT_ROUTES]);
    const commercialPath = pick(r, [...LICENSE_PATHS]);
    const specialRights = r() > 0.78 ? pick(r, SPECIAL_RIGHTS.filter((s) => s !== "None")) : "None";
    const owner = tier <= 2 && r() > 0.25 ? pick(r, MOCK_TEAM).name : null;
    const status = pick(r, [...LEAD_STATUSES].slice(0, tier <= 2 ? LEAD_STATUSES.length : 3));
    const daysAgo = Math.floor(r() * 21);

    leads.push({
      id: `l${String(i + 1).padStart(3, "0")}`,
      visitorName: r() > 0.3 ? `${pick(r, ["A.", "J.", "M.", "S.", "Y.", "D."])} ${pick(r, ["Kim", "Lee", "Park", "Choi", "Otieno", "Ng'ang'a"])}` : null,
      company,
      email: `lead${i + 1}@${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      industry,
      role: pick(r, ROLES),
      productRoute,
      commercialPath,
      computeBottleneck: pick(r, BOTTLENECKS),
      primaryPain: pick(r, PAINS),
      workloadType: pick(r, WORKLOADS),
      currentStack: Array.from(
        new Set([pick(r, STACKS), pick(r, STACKS)]),
      ),
      commercialIntent: pick(r, INTENTS),
      specialRights,
      timeline: pick(r, TIMELINES),
      score,
      tier,
      scoreBreakdown: breakdownFor(r, score),
      recommendedNextStep:
        tier === 1 ? "Book confidential ALPHA evaluation"
        : tier === 2 ? "Start paid ALPHA assessment"
        : tier === 3 ? "Send personalized brief"
        : "Educational content only",
      humanHandoffTrigger: tier <= 2,
      status,
      owner,
      ctaClicked: r() > 0.5 ? "Request Confidential ALPHA Evaluation" : null,
      documentsViewed: Math.floor(r() * 5),
      submittedAt: new Date(now - daysAgo * 86400000 - Math.floor(r() * 86400000)).toISOString(),
    });
  }

  return leads.sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
}

export const MOCK_LEADS: Lead[] = generate();
