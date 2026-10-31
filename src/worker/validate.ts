import { EMAIL, HOW, WHEN, WORK, YES_NO, formatPhone, phoneDigits, refersOut, type Intake } from './intake.ts';

export interface Submission {
  name: string;
  email: string;
  phone: string;
  message: string; // what the person typed; may be empty on the step-by-step form
  form: 'main' | 'sidebar';
  company: string; // the hidden spam-trap field; real people leave it empty
  fillMs: number; // milliseconds between page load and send; NaN when missing
  turnstileToken: string;
  intake?: Intake; // answers from the step-by-step form; absent for the self-test
}

export type Validation = { ok: true; value: Submission } | { ok: false; error: string };

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const pick = <T extends object>(choices: T, v: unknown) =>
  typeof v === 'string' && Object.hasOwn(choices, v) ? (v as keyof T) : undefined;

// The answers must be ones the form offers, and only the questions the form asks on that path.
function readIntake(v: unknown): Intake | null {
  if (!v || typeof v !== 'object') return null;
  const d = v as Record<string, unknown>;
  const how = pick(HOW, d.how);
  if (!how) return null;
  const intake: Intake = { how };
  if (d.when !== undefined) {
    intake.when = pick(WHEN, d.when);
    if (!intake.when) return null;
  }
  if (refersOut(intake)) return d.work === undefined && d.surgery === undefined && d.missedWork === undefined ? intake : null;
  intake.work = pick(WORK, d.work);
  if (!intake.work) return null;
  if (refersOut(intake)) return d.surgery === undefined && d.missedWork === undefined ? intake : null;
  intake.surgery = pick(YES_NO, d.surgery);
  intake.missedWork = pick(YES_NO, d.missedWork);
  return intake.surgery && intake.missedWork ? intake : null;
}

// Checks the same things the page checks, plus the acknowledgement, because the
// page can be bypassed. Error values are fixed codes, never the submitted text.
export function validate(input: unknown): Validation {
  if (!input || typeof input !== 'object') return { ok: false, error: 'bad_request' };
  const d = input as Record<string, unknown>;

  const name = text(d.name);
  const email = text(d.email);
  const message = text(d.message);
  let intake: Intake | undefined;
  if (d.intake !== undefined) {
    const i = readIntake(d.intake);
    if (!i) return { ok: false, error: 'invalid_intake' };
    intake = i;
  }

  if (!name || name.length > 200) return { ok: false, error: 'invalid_name' };
  if (!email || email.length > 254 || !EMAIL.test(email)) return { ok: false, error: 'invalid_email' };
  const digits = typeof d.phone === 'string' && d.phone.length <= 40 ? phoneDigits(d.phone) : null;
  if (!digits) return { ok: false, error: 'invalid_phone' };
  // "What happened" is optional on the step-by-step form.
  if ((!intake && !message) || message.length > 5000) return { ok: false, error: 'invalid_message' };
  if (d.acknowledged !== true) return { ok: false, error: 'acknowledgement_required' };
  const form = d.form === 'sidebar' ? 'sidebar' : d.form === 'main' ? 'main' : null;
  if (!form) return { ok: false, error: 'invalid_form' };

  return {
    ok: true,
    value: {
      name,
      email,
      phone: formatPhone(digits),
      message,
      form,
      company: text(d.company),
      fillMs: typeof d.fillMs === 'number' ? d.fillMs : NaN,
      turnstileToken: typeof d.turnstileToken === 'string' ? d.turnstileToken.slice(0, 4096) : '',
      ...(intake ? { intake } : {}),
    },
  };
}
