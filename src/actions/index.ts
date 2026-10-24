import { defineAction } from "astro:actions";
import {
  LETTERMINT_API_TOKEN,
  FROM_EMAIL,
  TO_EMAIL,
  TURNSTILE_SECRET_KEY,
} from "astro:env/server";
import { z } from "astro/zod";
import {
  createEnquiryIntake,
  createLettermintMailer,
  createTurnstileVerifier,
} from "../lib/enquiry";
import {
  CHALLENGE_TOKEN_FIELD,
  ELAPSED_FIELD,
  EMAIL_FIELD,
  HONEYPOT_FIELD,
  MESSAGE_FIELD,
  NAME_FIELD,
} from "../lib/enquiry-fields";

const intake = createEnquiryIntake({
  verifier: createTurnstileVerifier(TURNSTILE_SECRET_KEY),
  mailer: createLettermintMailer({
    apiToken: LETTERMINT_API_TOKEN,
    from: FROM_EMAIL,
    to: TO_EMAIL,
  }),
});

export const server = {
  sendMail: defineAction({
    accept: "form",
    input: z.object({
      [NAME_FIELD]: z.string().min(1, "Name is required"),
      [EMAIL_FIELD]: z.string().email("Invalid email"),
      [MESSAGE_FIELD]: z.string().min(1, "Message is required"),
      [HONEYPOT_FIELD]: z.string().optional(),
      [ELAPSED_FIELD]: z.coerce.number().optional(),
      [CHALLENGE_TOKEN_FIELD]: z.string().optional(),
    }),
    handler: async (input) => {
      const outcome = await intake.receive({
        name: input[NAME_FIELD],
        email: input[EMAIL_FIELD],
        message: input[MESSAGE_FIELD],
        honeypot: input[HONEYPOT_FIELD],
        fillTimeMs: input[ELAPSED_FIELD],
        challengeToken: input[CHALLENGE_TOKEN_FIELD],
      });

      switch (outcome.kind) {
        case "delivered":
          return { success: true, message: "Message sent successfully" };
        case "dropped":
          // Spam enquiries are silently dropped: the sender sees success, we log the reason
          console.warn(
            `${new Date().toISOString()} contact form: dropped spam enquiry (${outcome.reason})`,
          );
          return { success: true, message: "Message sent" };
        case "failed":
          console.error("sendMail failed", outcome.error);
          return { success: false, message: "There was an error sending the message" };
      }
    },
  }),
};
