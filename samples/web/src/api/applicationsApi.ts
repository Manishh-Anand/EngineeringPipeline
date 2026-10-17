/** Mirrors Sample.Api.Contracts.ApplicationDto. Keep in sync with the backend contract. */
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Application {
  id: number;
  name: string;
  owner: string;
  riskLevel: RiskLevel;
  lastAssessedUtc: string;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchApplications(signal?: AbortSignal): Promise<Application[]> {
  const response = await fetch(`${baseUrl}/api/applications`, { signal });
  if (!response.ok) throw new Error(`Failed to load applications (HTTP ${response.status})`);
  return (await response.json()) as Application[];
}
