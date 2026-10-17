import { useEffect, useState } from 'react';
import { fetchApplications, type Application } from '../api/applicationsApi';

export type ApplicationsState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ok'; data: Application[] };

export function useApplications(): ApplicationsState {
  const [state, setState] = useState<ApplicationsState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetchApplications(controller.signal)
      .then((data) => setState({ status: 'ok', data }))
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', error: e instanceof Error ? e.message : String(e) });
      });
    return () => controller.abort();
  }, []);

  return state;
}
