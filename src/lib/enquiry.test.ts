import { describe, expect, it } from "vitest";
import {
  createEnquiryIntake,
  type ChallengeVerifier,
  type Enquiry,
  type Mailer,
} from "./enquiry";

type Mail = Parameters<Mailer["send"]>[0];

const outbox = () => {
  const sent: Mail[] = [];
  const mailer: Mailer = {
    async send(mail) {
      sent.push(mail);
    },
  };
  return { sent, mailer };
};

const verifier = (passes = true) => {
  const calls: string[] = [];
  const fake: ChallengeVerifier = {
    async verify(token) {
      calls.push(token);
      return passes;
    },
  };
  return { calls, verifier: fake };
};

const genuine = (overrides: Partial<Enquiry> = {}): Enquiry => ({
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Loved the episode on the Analytical Engine.",
  fillTimeMs: 12000,
  challengeToken: "valid-token",
  ...overrides,
});

const setup = (passes = true) => {
  const out = outbox();
  const ver = verifier(passes);
  const intake = createEnquiryIntake({ verifier: ver.verifier, mailer: out.mailer });
  return { intake, sent: out.sent, calls: ver.calls };
};

describe("Enquiry intake", () => {
  it("delivers a genuine enquiry", async () => {
    const { intake, sent, calls } = setup();

    const outcome = await intake.receive(genuine());

    expect(outcome).toEqual({ kind: "delivered" });
    expect(calls).toEqual(["valid-token"]);
    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toBe("New web enquiry from Ada Lovelace");
    expect(sent[0].text).toBe(
      "New web enquiry\n\nName: Ada Lovelace\nEmail: ada@example.com\n\nMessage:\nLoved the episode on the Analytical Engine.",
    );
  });

  it("HTML-escapes a script tag in the name and message", async () => {
    const { intake, sent } = setup();

    await intake.receive(
      genuine({ name: "<script>alert(1)</script>", message: "Hi <script>x()</script>" }),
    );

    expect(sent[0].html).not.toContain("<script>");
    expect(sent[0].html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(sent[0].html).toContain("Hi &lt;script&gt;x()&lt;/script&gt;");
  });

  it("turns newlines in the message into br tags", async () => {
    const { intake, sent } = setup();

    await intake.receive(genuine({ message: "Line one\nLine two" }));

    expect(sent[0].html).toContain("Line one<br>Line two");
  });

  it("drops an enquiry with the honeypot filled", async () => {
    const { intake, sent } = setup();

    const outcome = await intake.receive(genuine({ honeypot: "http://spam.example" }));

    expect(outcome).toEqual({ kind: "dropped", reason: "honeypot" });
    expect(sent).toHaveLength(0);
  });

  it("drops an enquiry sent too fast", async () => {
    const { intake, sent } = setup();

    const outcome = await intake.receive(genuine({ fillTimeMs: 2999 }));

    expect(outcome).toEqual({ kind: "dropped", reason: "too fast" });
    expect(sent).toHaveLength(0);
  });

  it("treats a missing fill time as too fast", async () => {
    const { intake, sent } = setup();

    const outcome = await intake.receive(genuine({ fillTimeMs: undefined }));

    expect(outcome).toEqual({ kind: "dropped", reason: "too fast" });
    expect(sent).toHaveLength(0);
  });

  it("drops an enquiry whose name and message both look random", async () => {
    const { intake, sent } = setup();

    const outcome = await intake.receive(
      genuine({ name: "NoPAQGOHmXjjpIUDrWTsyvp", message: "qWeRtYuIoPaSdFgH" }),
    );

    expect(outcome).toEqual({ kind: "dropped", reason: "random strings" });
    expect(sent).toHaveLength(0);
  });

  it("drops an enquiry with no challenge token", async () => {
    const { intake, sent } = setup();

    const outcome = await intake.receive(genuine({ challengeToken: undefined }));

    expect(outcome).toEqual({ kind: "dropped", reason: "challenge failed" });
    expect(sent).toHaveLength(0);
  });

  it("drops an enquiry that fails the challenge", async () => {
    const { intake, sent } = setup(false);

    const outcome = await intake.receive(genuine());

    expect(outcome).toEqual({ kind: "dropped", reason: "challenge failed" });
    expect(sent).toHaveLength(0);
  });

  it("stops at the cheap checks before verifying the challenge", async () => {
    const { intake, calls } = setup();

    await intake.receive(genuine({ honeypot: "filled" }));

    expect(calls).toHaveLength(0);
  });

  it("fails when the challenge check can't be reached", async () => {
    const { mailer, sent } = outbox();
    const unreachable = new Error("siteverify returned 503");
    const intake = createEnquiryIntake({
      verifier: {
        async verify() {
          throw unreachable;
        },
      },
      mailer,
    });

    const outcome = await intake.receive(genuine());

    expect(outcome).toEqual({ kind: "failed", error: unreachable });
    expect(sent).toHaveLength(0);
  });

  it("fails when the mailer throws", async () => {
    const broken = new Error("Lettermint down");
    const intake = createEnquiryIntake({
      verifier: verifier().verifier,
      mailer: {
        async send() {
          throw broken;
        },
      },
    });

    const outcome = await intake.receive(genuine());

    expect(outcome).toEqual({ kind: "failed", error: broken });
  });

  it("delivers a random-looking name with a normal message", async () => {
    const { intake, sent } = setup();

    const outcome = await intake.receive(genuine({ name: "NoPAQGOHmXjjpIUDrWTsyvp" }));

    expect(outcome).toEqual({ kind: "delivered" });
    expect(sent).toHaveLength(1);
  });

  it("drops a real person whose name and message are single mixed-case words (accepted trade-off)", async () => {
    const { intake, sent } = setup();

    const outcome = await intake.receive(
      genuine({ name: "MacGillivray", message: "ThankYouGuys!" }),
    );

    expect(outcome).toEqual({ kind: "dropped", reason: "random strings" });
    expect(sent).toHaveLength(0);
  });
});
