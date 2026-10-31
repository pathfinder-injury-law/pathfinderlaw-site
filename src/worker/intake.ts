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

export const YES_NO = { yes: 'Yes', no: 'No', unsure: 'Not sure' } as const;

export type How = keyof typeof HOW;
export type Work = keyof typeof WORK;
export type YesNo = keyof typeof YES_NO;

export interface Intake {
  how: How;
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
export function route(i: Partial<Intake>): Route {
  if (refersOut(i)) return 'refer';
  if (i.how === 'overtime') return 'unlikely';
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

// The answer lines in the firm's email, plain words only.
export function intakeLines(i: Intake): string[] {
  return [
    `How hurt: ${HOW[i.how]}`,
    ...(i.work ? [`Where they work: ${WORK[i.work]}`] : []),
    ...(i.surgery ? [`Surgery had or recommended: ${YES_NO[i.surgery]}`] : []),
    ...(i.missedWork ? [`Missed work or earned less: ${YES_NO[i.missedWork]}`] : []),
  ];
}

// US phone numbers only: 10 digits (a leading 1 is dropped), area code not starting with 0 or 1.
export function phoneDigits(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return /^[2-9]\d{9}$/.test(d) ? d : null;
}

export const formatPhone = (d: string) => `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;

// The same email pattern the page and the Worker both use.
export const EMAIL = /^[^\s@<>,;:"]+@[^\s@<>,;:"]+\.[^\s@<>,;:"]{2,}$/;
