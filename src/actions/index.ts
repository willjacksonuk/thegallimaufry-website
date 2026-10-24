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
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
      message: z.string().min(1, "Message is required"),
      website: z.string().optional(),
      elapsed: z.coerce.number().optional(),
      "cf-turnstile-response": z.string().optional(),
    }),
    handler: async (input) => {
      const outcome = await intake.receive({
        name: input.name,
        email: input.email,
        message: input.message,
        honeypot: input.website,
        fillTimeMs: input.elapsed,
        challengeToken: input["cf-turnstile-response"],
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
