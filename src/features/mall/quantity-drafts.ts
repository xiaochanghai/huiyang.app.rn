import { createContext } from 'react';

// Inputs register a commit operation so submitting never depends on native blur events.
export class QuantityDrafts {
  private commits = new Map<object, () => Promise<void>>();

  register(key: object, commit: () => Promise<void>) {
    this.commits.set(key, commit);
    return () => {
      this.commits.delete(key);
    };
  }

  async flush() {
    for (const commit of [...this.commits.values()]) await commit();
  }
}

export const QuantityDraftContext = createContext<QuantityDrafts | null>(null);
