import type { Application } from '../api/applicationsApi';

interface ApplicationTableProps {
  applications: Application[];
}

export function ApplicationTable({ applications }: ApplicationTableProps) {
  if (applications.length === 0) return <p>No applications match.</p>;

  return (
    <table>
      <caption>Applications</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Owner</th>
          <th scope="col">Risk</th>
          <th scope="col">Last assessed</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((a) => (
          <tr key={a.id}>
            <td>{a.name}</td>
            <td>{a.owner}</td>
            <td>{a.riskLevel}</td>
            <td>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(a.lastAssessedUtc))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
