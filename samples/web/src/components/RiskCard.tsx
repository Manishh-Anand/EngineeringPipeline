import type { RiskLevel } from '../api/applicationsApi';

interface RiskCardProps {
  level: RiskLevel;
  count: number;
}

export function RiskCard({ level, count }: RiskCardProps) {
  return (
    <section aria-label={`${level} risk applications`}>
      <h3>{level}</h3>
      <p>{count}</p>
    </section>
  );
}
