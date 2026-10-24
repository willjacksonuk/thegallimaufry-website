import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { Window } from "happy-dom";
import { beforeAll, describe, expect, it } from "vitest";
import {
  EMAIL_FIELD,
  HONEYPOT_FIELD,
  MESSAGE_FIELD,
  NAME_FIELD,
} from "../lib/enquiry-fields";
import Contact from "./contact.astro";

// The leading underscore keeps Astro from treating this file as a route.
//
// Rendered on the server, then parsed with happy-dom. The page is rendered
// under Node rather than a happy-dom environment, because Astro won't render
// components when it thinks it's in a browser.
let form: NonNullable<ReturnType<Window["document"]["querySelector"]>>;

beforeAll(async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Contact);
  const { document } = new Window();
  document.write(html);
  form = document.querySelector("#contact-form")!;
});

describe("Contact page", () => {
  it("names its fields after the shared Enquiry field names", () => {
    // ELAPSED_FIELD and CHALLENGE_TOKEN_FIELD aren't in the markup: the page
    // script sets elapsed on submit, and Turnstile adds cf-turnstile-response
    const named = [...form.querySelectorAll("[name]")].map((field) => [
      field.tagName.toLowerCase(),
      field.getAttribute("name"),
    ]);

    expect(named).toEqual([
      ["input", NAME_FIELD],
      ["input", HONEYPOT_FIELD],
      ["input", EMAIL_FIELD],
      ["textarea", MESSAGE_FIELD],
    ]);
  });

  it("labels the honeypot by its field name", () => {
    expect(form.querySelector(`label[for="${HONEYPOT_FIELD}"]`)).not.toBeNull();
    expect(form.querySelector(`#${HONEYPOT_FIELD}`)?.getAttribute("name")).toBe(HONEYPOT_FIELD);
  });

  it("gives the Turnstile container an id that doesn't shadow window.turnstile", () => {
    expect(form.querySelector("#turnstile-widget")).not.toBeNull();
    expect(form.querySelector("#turnstile")).toBeNull();
  });
});
