import { describe, expect, it } from "vitest";
import * as show from "./show";

describe("Show", () => {
  it("lists the four places to listen, in order", () => {
    expect(show.listenOn.map((platform) => platform.label)).toEqual([
      "Apple Podcasts",
      "Spotify",
      "Amazon Music",
      "RSS",
    ]);
  });

  it("has a url without a trailing slash, so Episode urls don't get a double slash", () => {
    expect(show.url).toBe("https://thegallimaufry.show");
    expect(show.url.endsWith("/")).toBe(false);
  });
});
