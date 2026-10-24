import { CHALLENGE_TOKEN_FIELD, ELAPSED_FIELD } from "../lib/enquiry-fields";

export interface Turnstile {
  render(container: HTMLElement, options: { sitekey: string; action?: string }): string;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export interface ContactFormOptions {
  // Sends the Enquiry, matching actions.sendMail
  send: (formData: FormData) => Promise<{ data?: { success?: boolean } }>;
  loadTurnstile?: () => Promise<Turnstile>;
  clock?: { now(): number };
}

// The widget's container id must not be "turnstile": browsers expose
// element ids as window properties, which would shadow window.turnstile
// Load the Turnstile script once and reuse it across page navigations
let turnstileLoader: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  turnstileLoader ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile unavailable"));
    script.onerror = () => {
      turnstileLoader = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return turnstileLoader;
}

export function setUpContactForm(form: HTMLFormElement, options: ContactFormOptions) {
  const { send, clock = Date } = options;
  const successMessage = document.getElementById("success-message");
  const errorMessage = document.getElementById("error-message");
  const challenge = document.getElementById("turnstile-widget");
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const loadedAt = clock.now();
  let turnstile: Turnstile | null = null;
  let widgetId: string | null = null;
  let sending = false;

  const showError = () => {
    if (errorMessage) errorMessage.style.display = "block";
  };

  const setSending = (value: boolean) => {
    sending = value;
    if (submitButton) submitButton.disabled = value;
  };

  if (challenge?.dataset.sitekey) {
    (options.loadTurnstile ?? loadTurnstile)()
      .then((loaded) => {
        turnstile = loaded;
        widgetId = loaded.render(challenge, {
          sitekey: challenge.dataset.sitekey!,
          action: "contact",
        });
      })
      .catch(showError);
  }

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    if (sending) return;
    if (errorMessage) errorMessage.style.display = "none";

    const sendFormData = new FormData(form);
    sendFormData.set(ELAPSED_FIELD, String(clock.now() - loadedAt));

    // Without a challenge token the enquiry would be dropped, so stop here
    if (!sendFormData.get(CHALLENGE_TOKEN_FIELD)) {
      showError();
      return;
    }

    setSending(true);
    try {
      const result = await send(sendFormData);
      if (result.data?.success) {
        form.reset();
        form.style.display = "none";
        if (successMessage) successMessage.style.display = "block";
        return;
      }
    } catch (error) {
      console.error(error);
    }

    // Challenge tokens are single use, so get a fresh one for a retry
    if (turnstile && widgetId) turnstile.reset(widgetId);
    setSending(false);
    showError();
  };

  form.addEventListener("submit", handleSubmit);
}
