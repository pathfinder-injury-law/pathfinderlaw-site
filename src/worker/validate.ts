export interface Submission {
  name: string;
  email: string;
  phone: string;
  message: string;
  form: 'main' | 'sidebar';
  company: string; // the hidden spam-trap field; real people leave it empty
  fillMs: number; // milliseconds between page load and send; NaN when missing
  turnstileToken: string;
}

export type Validation = { ok: true; value: Submission } | { ok: false; error: string };

const EMAIL = /^[^\s@<>,;:"]+@[^\s@<>,;:"]+\.[^\s@<>,;:"]{2,}$/;

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

// Checks the same things the page checks, plus the acknowledgement, because the
// page can be bypassed. Error values are fixed codes, never the submitted text.
export function validate(input: unknown): Validation {
  if (!input || typeof input !== 'object') return { ok: false, error: 'bad_request' };
  const d = input as Record<string, unknown>;

  const name = text(d.name);
  const email = text(d.email);
  const phone = text(d.phone);
  const message = text(d.message);

  if (!name || name.length > 200) return { ok: false, error: 'invalid_name' };
  if (!email || email.length > 254 || !EMAIL.test(email)) return { ok: false, error: 'invalid_email' };
  const digits = phone.replace(/\D/g, '').length;
  if (phone.length > 40 || digits < 7 || digits > 20) return { ok: false, error: 'invalid_phone' };
  if (!message || message.length > 5000) return { ok: false, error: 'invalid_message' };
  if (d.acknowledged !== true) return { ok: false, error: 'acknowledgement_required' };
  const form = d.form === 'sidebar' ? 'sidebar' : d.form === 'main' ? 'main' : null;
  if (!form) return { ok: false, error: 'invalid_form' };

  return {
    ok: true,
    value: {
      name,
      email,
      phone,
      message,
      form,
      company: text(d.company),
      fillMs: typeof d.fillMs === 'number' ? d.fillMs : NaN,
      turnstileToken: typeof d.turnstileToken === 'string' ? d.turnstileToken.slice(0, 4096) : '',
    },
  };
}
