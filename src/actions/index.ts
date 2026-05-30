import { Resend } from "resend";
import { defineAction } from "astro:actions";
import { RESEND_API_KEY, FROM_EMAIL, TO_EMAIL } from "astro:env/server";
import { z } from "astro/zod";

const resend = new Resend(RESEND_API_KEY);

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
        const { name, email, message } = input;

        await resend.emails.send({
          from: FROM_EMAIL,
          to: TO_EMAIL,
          subject: `New contact message from ${name}`,
          html: `
            <h2>New contact message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, "<br>")}</p>
          `,
        });

        return { success: true, message: "Email sent successfully" };
      } catch (error) {
        return { success: false, message: "There was an error sending the email" };
      }
    },
  }),
};