import { useState } from 'react';
import type { Application, RiskLevel } from '../api/applicationsApi';
import { ApplicationTable } from '../components/ApplicationTable';
import { FilterBar } from '../components/FilterBar';
import { RiskCard } from '../components/RiskCard';
import { useApplications } from '../hooks/useApplications';

const LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];

export function Dashboard() {
  const state = useApplications();
  const [search, setSearch] = useState('');

  if (state.status === 'loading') return <p aria-live="polite">Loading…</p>;
  if (state.status === 'error') return <p role="alert">{state.error}</p>;

  const applications = state.data;
  const visible = applications.filter((a) => a.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <main>
      <h1>Application Dashboard</h1>
      <FilterBar search={search} onSearchChange={setSearch} />
      <div>
        {LEVELS.map((level) => (
          <RiskCard key={level} level={level} count={countByLevel(visible, level)} />
        ))}
      </div>
      <ApplicationTable applications={applications} />
    </main>
  );
}

function countByLevel(apps: Application[], level: RiskLevel): number {
  return apps.filter((a) => a.riskLevel === level).length;
}
