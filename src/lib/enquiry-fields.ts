// Names of the contact form's fields, shared by the page script and the sendMail action.
// This module imports nothing so it stays safe to bundle for the browser.

export const NAME_FIELD = "name";
export const EMAIL_FIELD = "email";
export const MESSAGE_FIELD = "message";

// Hidden honeypot field: people never fill it in, bots often do
export const HONEYPOT_FIELD = "website";

// Milliseconds between the page loading and the form being sent
export const ELAPSED_FIELD = "elapsed";

// Cloudflare's Turnstile widget chooses this name for the hidden input it adds
export const CHALLENGE_TOKEN_FIELD = "cf-turnstile-response";
