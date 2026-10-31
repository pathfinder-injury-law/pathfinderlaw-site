import type { KVNamespace } from './types.ts';
import type { Submission } from './validate.ts';

// Rules live in the KV store (key "rules") as plain JSON so they stay out of
// the public repository. Words and domains only, no patterns, so a bad rule
// cannot stall the form.
export interface Rules {
  agencyDomains: string[];
  agencyPhrases: string[];
  caseWords: string[]; // word beginnings that mark a real case ("injur", "doctor")
  limits: {
    screenAtLinks: number; // this many links and no case words: screened
    repeatWindowHours: number;
    repeatMax: number; // this many earlier messages from the same email in the window
  };
}

export type Decision = { outcome: 'lead' | 'screened' | 'unsure'; reason: string };

const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === 'string');

export async function loadRules(kv: KVNamespace | undefined): Promise<Rules> {
  if (!kv) throw new Error('no_kv');
  const raw = await kv.get('rules');
  if (!raw) throw new Error('no_rules');
  const r = JSON.parse(raw);
  const l = r?.limits;
  if (
    !strings(r?.agencyDomains) ||
    !strings(r?.agencyPhrases) ||
    !strings(r?.caseWords) ||
    typeof l?.screenAtLinks !== 'number' ||
    typeof l?.repeatWindowHours !== 'number' ||
    typeof l?.repeatMax !== 'number'
  ) {
    throw new Error('bad_rules');
  }
  return r as Rules;
}

const URL_LIKE = /\b(?:https?:\/\/|www\.)[^\s<>"')]+|(?<![@\w.-])[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|co|biz|info|xyz|ai|us|top|site|online|shop|link|ly)\b(?:\/[^\s<>"')]*)?/gi;

export function findLinkHosts(message: string): string[] {
  const hosts: string[] = [];
  for (const m of message.match(URL_LIKE) ?? []) {
    try {
      hosts.push(new URL(/^https?:\/\//i.test(m) ? m : `http://${m}`).hostname.toLowerCase().replace(/^www\./, ''));
    } catch {
      hosts.push(m.toLowerCase());
    }
  }
  return hosts;
}

const esc = (s: string) => s.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const onDomain = (host: string, domains: string[]) =>
  domains.some((d) => {
    const dom = d.toLowerCase().replace(/^www\./, '');
    return host === dom || host.endsWith(`.${dom}`);
  });

// Pure decision. `earlierFromSameEmail` is the count of earlier submissions
// from the same email inside the repeat window (looked up by the caller).
export function decide(sub: Submission, rules: Rules, earlierFromSameEmail: number): Decision {
  const msg = sub.message.toLowerCase();
  const emailHost = sub.email.toLowerCase().split('@')[1] ?? '';
  const links = findLinkHosts(sub.message);

  // Answering the step-by-step questions counts as describing a real case.
  const hasCaseWords = sub.intake !== undefined || rules.caseWords.some((w) => new RegExp(`\\b${esc(w)}`).test(msg));

  // A known agency domain, as the sender or as a link, is screened even with case words.
  if (onDomain(emailHost, rules.agencyDomains) || links.some((h) => onDomain(h, rules.agencyDomains))) {
    return { outcome: 'screened', reason: 'agency_domain' };
  }
  const phrase = rules.agencyPhrases.find((p) => new RegExp(`\\b${esc(p)}\\b`).test(msg));
  if (phrase) {
    return hasCaseWords
      ? { outcome: 'unsure', reason: 'agency_phrase_with_case_words' }
      : { outcome: 'screened', reason: `agency_phrase: ${phrase}` };
  }
  if (earlierFromSameEmail >= rules.limits.repeatMax) {
    return hasCaseWords
      ? { outcome: 'unsure', reason: 'repeat_sender_with_case_words' }
      : { outcome: 'screened', reason: 'repeat_sender' };
  }
  if (links.length >= rules.limits.screenAtLinks && !hasCaseWords) {
    return { outcome: 'screened', reason: `many_links (${links.length})` };
  }
  if (links.length >= 1) return { outcome: 'unsure', reason: 'has_link' };
  return { outcome: 'lead', reason: 'clean' };
}
