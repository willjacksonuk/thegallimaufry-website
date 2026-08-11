import { Lettermint } from "lettermint";
import escapeHtml from "escape-html";
import { defineAction } from "astro:actions";
import { LETTERMINT_API_TOKEN, FROM_EMAIL, TO_EMAIL } from "astro:env/server";
import { z } from "astro/zod";

const email = Lettermint.email(LETTERMINT_API_TOKEN);

export const server = {
  sendMail: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
      message: z.string().min(1, "Message is required"),
      honeypot: z.string().optional(),
    }),
    handler: async (input) => {
      if (input.honeypot) {
        return { success: true, message: "Message sent" };
      }

      try {
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