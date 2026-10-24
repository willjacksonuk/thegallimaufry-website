import { Lettermint } from "lettermint";
import escapeHtml from "escape-html";

export type Enquiry = {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
  fillTimeMs?: number;
  challengeToken?: string;
};

export type DropReason = "honeypot" | "too fast" | "random strings" | "challenge failed";

export type EnquiryOutcome =
  | { kind: "delivered" }
  | { kind: "dropped"; reason: DropReason }
  | { kind: "failed"; error: unknown };

export interface ChallengeVerifier {
  // Throws if the check can't be reached
  verify(token: string): Promise<boolean>;
}

export interface Mailer {
  // The from and to addresses belong to the adapter
  send(mail: { subject: string; html: string; text: string }): Promise<void>;
}

// Real people take longer than this to fill in the form; bots usually don't
const MIN_FILL_TIME_MS = 3000;

// A single "word" of 10+ characters in mixed case, e.g. "NoPAQGOHmXjjpIUDrWTsyvp"
const looksRandom = (value: string) => {
  const trimmed = value.trim();
  return (
    trimmed.length >= 10 &&
    !/\s/.test(trimmed) &&
    /[a-z]/.test(trimmed) &&
    /[A-Z]/.test(trimmed)
  );
};

// Cheap checks first, so the challenge is only verified when they pass
const screen = async (
  enquiry: Enquiry,
  verifier: ChallengeVerifier,
): Promise<DropReason | undefined> => {
  if (enquiry.honeypot) {
    return "honeypot";
  }

  if (enquiry.fillTimeMs === undefined || enquiry.fillTimeMs < MIN_FILL_TIME_MS) {
    return "too fast";
  }

  if (looksRandom(enquiry.name) && looksRandom(enquiry.message)) {
    return "random strings";
  }

  const token = enquiry.challengeToken;
  if (!token || !(await verifier.verify(token))) {
    return "challenge failed";
  }

  return undefined;
};

const compose = ({ name, email, message }: Enquiry) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  return {
    subject: `New web enquiry from ${name}`,
    html: `
            <h2>New web enquiry</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <h3>Message</h3>
            <p>${safeMessage}</p>
          `,
    text: `New web enquiry\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };
};

export const createEnquiryIntake = ({
  verifier,
  mailer,
}: {
  verifier: ChallengeVerifier;
  mailer: Mailer;
}) => ({
  async receive(enquiry: Enquiry): Promise<EnquiryOutcome> {
    try {
      const reason = await screen(enquiry, verifier);
      if (reason) {
        return { kind: "dropped", reason };
      }

      await mailer.send(compose(enquiry));
      return { kind: "delivered" };
    } catch (error) {
      return { kind: "failed", error };
    }
  },
});

export const createTurnstileVerifier = (secretKey: string): ChallengeVerifier => ({
  async verify(token) {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretKey, response: token }),
      },
    );
    if (!response.ok) {
      throw new Error(`Turnstile siteverify returned ${response.status}`);
    }
    const result = (await response.json()) as { success: boolean };
    return result.success;
  },
});

export const createLettermintMailer = ({
  apiToken,
  from,
  to,
}: {
  apiToken: string;
  from: string;
  to: string;
}): Mailer => {
  const email = Lettermint.email(apiToken);
  return {
    async send({ subject, html, text }) {
      await email.from(from).to(to).subject(subject).html(html).text(text).send();
    },
  };
};
