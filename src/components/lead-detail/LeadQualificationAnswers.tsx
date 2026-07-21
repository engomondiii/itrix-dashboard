import type { QualificationAnswers } from "@/types/lead";

const ROWS: [string, keyof QualificationAnswers][] = [
  ["Computation problem", "computationProblem"],
  ["Organization", "organizationType"],
  ["Role", "role"],
  ["Primary pain", "primaryPain"],
  ["Workload type", "workloadType"],
  ["Current stack", "currentStack"],
  ["Commercial intent", "commercialIntent"],
  ["Rights interest", "commercialRights"],
  ["Timeline", "timeline"],
];

export function LeadQualificationAnswers({ answers }: { answers: QualificationAnswers }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {ROWS.map(([label, key]) => {
        const v = answers[key];
        return (
          <div key={key}>
            <dt className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
              {label}
            </dt>
            <dd className="mt-0.5 text-sec text-ink-primary">
              {Array.isArray(v) ? v.join(", ") : v}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
