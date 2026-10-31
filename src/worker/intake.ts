// The step-by-step intake form's questions, answers and sorting rule. Shared by the
// form on the page (src/components/ContactForm.astro) and the Worker, so the page and
// the firm's email always agree. The Worker re-sorts on its own; it never trusts the page.
// Questions, answers and the PRIORITY rule were approved by Bryn on Oct 31, 2026.

export const HOW = {
  accident: 'An accident at work',
  overtime: 'It built up over time',
  sick: 'I got sick from something at work',
  disability: 'I need help with Social Security disability',
  other: 'Something else or not sure',
} as const;

export const WORK = {
  virginia: 'A private company, or a city or county government, in Virginia',
  state: 'A Virginia state agency',
  federal: 'The federal government',
  railroad: 'A railroad',
  shipyard: 'A shipyard, a port, or on the water',
  outside: 'A job outside Virginia',
  unsure: 'Not sure',
} as const;

export const WHEN = {
  month: 'In the last month',
  sixMonths: '1 to 6 months ago',
  year: '6 months to a year ago',
  twoYears: '1 to 2 years ago',
  older: 'More than 2 years ago',
  unsure: 'Not sure',
} as const;

export const YES_NO = { yes: 'Yes', no: 'No', unsure: 'Not sure' } as const;

export type How = keyof typeof HOW;
export type Work = keyof typeof WORK;
export type When = keyof typeof WHEN;
export type YesNo = keyof typeof YES_NO;

export interface Intake {
  how: How;
  when?: When; // asked on every path; optional only so a page loaded before the question existed still sends
  work?: Work; // not asked when "how" already sends the person elsewhere
  surgery?: YesNo; // not asked on the refer-out path
  missedWork?: YesNo; // not asked on the refer-out path
}

export type Route = 'priority' | 'possible' | 'refer' | 'unlikely';

// Claims the firm does not handle but refers to other lawyers.
const REFER_HOW: How[] = ['sick', 'disability'];
const REFER_WORK: Work[] = ['state', 'federal', 'railroad', 'shipyard', 'outside'];

export const refersOut = (i: Partial<Intake>) =>
  (i.how !== undefined && REFER_HOW.includes(i.how)) || (i.work !== undefined && REFER_WORK.includes(i.work));

// Refer out beats "likely not a case", which beats a possible case. Every "Not sure" stays with the firm.
// More than 2 years ago is likely past Virginia's 2-year filing deadline (rule approved by Bryn, Oct 31, 2026).
export function route(i: Partial<Intake>): Route {
  if (refersOut(i)) return 'refer';
  if (i.how === 'overtime' || i.when === 'older') return 'unlikely';
  if (i.surgery === 'yes' && i.missedWork === 'yes') return 'priority';
  return 'possible';
}

// Added to the end of the email subject, "Website inquiry - ...".
export const ROUTE_SUBJECT: Record<Route, string> = {
  priority: 'PRIORITY case',
  possible: 'Possible case',
  refer: 'Refer out',
  unlikely: 'Likely not a case',
};

// The answers in the firm's email, plain words only, as [question, answer] pairs.
export function intakeRows(i: Intake): [string, string][] {
  return [
    ['How hurt', HOW[i.how]],
    ...(i.when ? [['When it happened', WHEN[i.when]] as [string, string]] : []),
    ...(i.work ? [['Where they work', WORK[i.work]] as [string, string]] : []),
    ...(i.surgery ? [['Surgery had or recommended', YES_NO[i.surgery]] as [string, string]] : []),
    ...(i.missedWork ? [['Missed work or earned less', YES_NO[i.missedWork]] as [string, string]] : []),
  ];
}

// A deadline warning for the firm's email, in plain words, or nothing.
export function deadlineNote(i: Intake): string | null {
  if (i.when === 'older') return 'This happened more than 2 years ago. The filing deadline may have passed.';
  if (i.when === 'twoYears') return 'This happened 1 to 2 years ago. The 2-year filing deadline may be close. Call soon.';
  return null;
}

export const intakeLines = (i: Intake): string[] => intakeRows(i).map(([q, a]) => `${q}: ${a}`);

// US phone numbers only: 10 digits (a leading 1 is dropped), area code not starting with 0 or 1.
export function phoneDigits(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return /^[2-9]\d{9}$/.test(d) ? d : null;
}

export const formatPhone = (d: string) => `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;

// The same email pattern the page and the Worker both use.
export const EMAIL = /^[^\s@<>,;:"]+@[^\s@<>,;:"]+\.[^\s@<>,;:"]{2,}$/;
