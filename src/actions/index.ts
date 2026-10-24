import { Lettermint } from "lettermint";
import escapeHtml from "escape-html";
import { defineAction } from "astro:actions";
import {
  LETTERMINT_API_TOKEN,
  FROM_EMAIL,
  TO_EMAIL,
  TURNSTILE_SECRET_KEY,
} from "astro:env/server";
import { z } from "astro/zod";

const email = Lettermint.email(LETTERMINT_API_TOKEN);

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

const passesTurnstile = async (token: string) => {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: TURNSTILE_SECRET_KEY, response: token }),
    },
  );
  if (!response.ok) {
    throw new Error(`Turnstile siteverify returned ${response.status}`);
  }
  const result = (await response.json()) as { success: boolean };
  return result.success;
};

// Spam enquiries are silently dropped: the sender sees success, we log the reason
const silentDrop = (reason: string) => {
  console.warn(`${new Date().toISOString()} contact form: dropped spam enquiry (${reason})`);
  return { success: true, message: "Message sent" };
};

export const server = {
  sendMail: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
      message: z.string().min(1, "Message is required"),
      website: z.string().optional(),
      elapsed: z.coerce.number().optional(),
      "cf-turnstile-response": z.string().optional(),
    }),
    handler: async (input) => {
      if (input.website) {
        return silentDrop("honeypot");
      }

      if (input.elapsed === undefined || input.elapsed < MIN_FILL_TIME_MS) {
        return silentDrop("too fast");
      }

      if (looksRandom(input.name) && looksRandom(input.message)) {
        return silentDrop("random strings");
      }

      try {
        const token = input["cf-turnstile-response"];
        if (!token || !(await passesTurnstile(token))) {
          return silentDrop("challenge failed");
        }

        const { name, email: senderEmail, message } = input;
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(senderEmail);
        const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

        await email
          .from(FROM_EMAIL)
          .to(TO_EMAIL)
          .subject(`New web enquiry from ${name}`)
          .html(`
            <h2>New web enquiry</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <h3>Message</h3>
            <p>${safeMessage}</p>
          `)
          .text(
            `New web enquiry\n\nName: ${name}\nEmail: ${senderEmail}\n\nMessage:\n${message}`,
          )
          .send();

        return { success: true, message: "Message sent successfully" };
      } catch (error) {
        console.error("sendMail failed", error);
        return { success: false, message: "There was an error sending the message" };
      }
    },
  }),
};
