// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setUpContactForm, type ContactFormOptions, type Turnstile } from "./contact-form";

// The markup from src/pages/contact.astro
const markup = `
  <p id="success-message" style="display: none;">Thanks for getting in touch.</p>
  <p id="error-message" role="alert" style="display: none;">Sorry, we couldn't send your message.</p>
  <form id="contact-form" method="POST" class="grid gap-4">
    <input name="name" type="text" placeholder="Name" required />
    <div class="form-extra" aria-hidden="true">
      <label for="website">Website</label>
      <input id="website" type="text" name="website" tabindex="-1" autocomplete="off" />
    </div>
    <input name="email" type="email" placeholder="Email" required />
    <textarea name="message" placeholder="Message" required></textarea>
    <div id="turnstile-widget" data-sitekey="test-site-key"></div>
    <button type="submit"> Send </button>
  </form>
`;

type SendResult = Awaited<ReturnType<ContactFormOptions["send"]>>;

const fakeTurnstile = () => {
  const resets: string[] = [];
  let container: HTMLElement | null = null;
  const turnstile: Turnstile = {
    render(element) {
      container = element;
      return "widget-1";
    },
    reset(widgetId) {
      resets.push(widgetId);
    },
  };
  // Turnstile adds a hidden input holding the token once the visitor passes the Challenge
  const pass = (token = "valid-token") => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "cf-turnstile-response";
    input.value = token;
    container!.appendChild(input);
  };
  return { turnstile, resets, pass };
};

const fakeSend = (result: () => Promise<SendResult>) => {
  const sent: FormData[] = [];
  const send = vi.fn(async (formData: FormData) => {
    sent.push(formData);
    return result();
  });
  return { send, sent };
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const elements = () => ({
  form: document.getElementById("contact-form") as HTMLFormElement,
  button: document.querySelector('button[type="submit"]') as HTMLButtonElement,
  success: document.getElementById("success-message")!,
  error: document.getElementById("error-message")!,
});

const setup = async (
  result: () => Promise<SendResult> = async () => ({ data: { success: true } }),
  overrides: Partial<ContactFormOptions> = {},
) => {
  const widget = fakeTurnstile();
  const { send, sent } = fakeSend(result);
  let time = 1000;
  const clock = { now: () => time };
  const els = elements();
  setUpContactForm(els.form, {
    send,
    loadTurnstile: async () => widget.turnstile,
    clock,
    ...overrides,
  });
  await flush();
  const submit = async () => {
    els.form.dispatchEvent(new Event("submit", { cancelable: true }));
    await flush();
  };
  const advance = (ms: number) => (time += ms);
  return { ...els, ...widget, send, sent, submit, advance };
};

beforeEach(() => {
  document.body.innerHTML = markup;
});

describe("Contact form", () => {
  it("sends the elapsed time since the page loaded", async () => {
    const { pass, submit, advance, sent } = await setup();

    pass();
    advance(4500);
    await submit();

    expect(sent).toHaveLength(1);
    expect(sent[0].get("elapsed")).toBe("4500");
    expect(sent[0].get("cf-turnstile-response")).toBe("valid-token");
  });

  it("shows the error and doesn't send without a challenge token", async () => {
    const { submit, send, error } = await setup();

    await submit();

    expect(send).not.toHaveBeenCalled();
    expect(error.style.display).toBe("block");
  });

  it("resets the widget and shows the error when sending fails", async () => {
    const { pass, submit, resets, error, form } = await setup(async () => ({
      data: { success: false },
    }));

    pass();
    await submit();

    expect(resets).toEqual(["widget-1"]);
    expect(error.style.display).toBe("block");
    expect(form.style.display).not.toBe("none");
  });

  it("resets the widget and shows the error when sending throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { pass, submit, resets, error } = await setup(async () => {
      throw new Error("network down");
    });

    pass();
    await submit();

    expect(resets).toEqual(["widget-1"]);
    expect(error.style.display).toBe("block");
  });

  it("hides the form and shows the success message once sent", async () => {
    const { pass, submit, form, success, error } = await setup();

    pass();
    await submit();

    expect(form.style.display).toBe("none");
    expect(success.style.display).toBe("block");
    expect(error.style.display).toBe("none");
  });

  it("sends once for two quick submits, disabling Send until a failure", async () => {
    const reply = deferred<SendResult>();
    const { pass, submit, send, button } = await setup(() => reply.promise);

    pass();
    await submit();
    await submit();

    expect(send).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);

    reply.resolve({ data: { success: false } });
    await flush();

    expect(button.disabled).toBe(false);
  });

  it("shows the error when Turnstile fails to load", async () => {
    const { error } = await setup(undefined, {
      loadTurnstile: () => Promise.reject(new Error("Turnstile failed to load")),
    });

    expect(error.style.display).toBe("block");
  });
});
