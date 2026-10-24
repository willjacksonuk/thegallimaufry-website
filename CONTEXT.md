# The Gallimaufry

Website for The Gallimaufry history podcast: episode listings, show information, and a way for listeners to get in touch.

## Language

**Show**:
The Gallimaufry podcast as a whole: its name, description and the places people can listen to it.
_Avoid_: Podcast, series, channel

**Episode**:
One instalment of the **Show**, as published on Buzzsprout, with its own page on the site.
_Avoid_: Post, track, entry

**Enquiry**:
A message a visitor sends through the contact form, meant for the show's inbox.
_Avoid_: Submission, contact, lead

**Screening**:
The checks every **Enquiry** goes through to decide whether it is a **Spam enquiry**, before anything is delivered.
_Avoid_: Filtering, validation, moderation

**Challenge**:
The check a visitor passes on the contact form to show they are a person rather than a bot. Passing it is part of **Screening**.
_Avoid_: Captcha, human check

**Spam enquiry**:
An enquiry produced by a bot rather than a person, typically random strings in the name and message fields.
_Avoid_: Junk, abuse

**Silent drop**:
Discarding a spam enquiry while telling the sender it was sent, so the bot learns nothing.
_Avoid_: Reject, block

**Delivery**:
An **Enquiry** that passed **Screening** reaching the show's inbox by email. If delivery fails, the sender is told and given the inbox address instead.
_Avoid_: Sending, forwarding

## Relationships

- A **Show** has many **Episodes**; each **Episode** has exactly one page, and no two **Episodes** may share a page address
- Every **Enquiry** goes through **Screening**, then ends in exactly one of: **Delivery**, a **Silent drop**, or a failure the sender is told about
- An **Enquiry** that shows a clear bot signal during **Screening** is treated as a **Spam enquiry** and gets a **Silent drop**
- A genuine **Enquiry** must never get a **Silent drop**: losing one is worse than letting some spam through
- When **Screening** itself can't finish (for example, the **Challenge** can't be checked), the sender is told it failed rather than getting a **Silent drop**

## Example dialogue

> **Dev:** "This **Enquiry** has a filled honeypot. Do we error?"
> **Will:** "No, it's a **Spam enquiry**. **Silent drop** it and show the success message."

> **Dev:** "Cloudflare is down, so **Screening** can't finish. Drop it?"
> **Will:** "No. Tell them it failed and show the inbox address. It might be a real person."
