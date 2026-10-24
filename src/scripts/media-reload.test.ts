// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { reloadFailedMedia } from "./media-reload";

// happy-dom doesn't define the networkState constants, so give them their spec values
Object.assign(HTMLMediaElement, {
  NETWORK_EMPTY: 0,
  NETWORK_IDLE: 1,
  NETWORK_LOADING: 2,
  NETWORK_NO_SOURCE: 3,
});

const player = (networkState: number) => {
  const audio = document.createElement("audio");
  audio.src = "https://example.com/episode.mp3";
  Object.defineProperty(audio, "networkState", { value: networkState });
  const load = vi.spyOn(audio, "load").mockImplementation(() => {});
  document.body.append(audio);
  return load;
};

describe("reloadFailedMedia", () => {
  it("reloads a player whose source failed to resolve during the swap", () => {
    document.body.innerHTML = "";
    const load = player(HTMLMediaElement.NETWORK_NO_SOURCE);

    reloadFailedMedia(document);

    expect(load).toHaveBeenCalledOnce();
  });

  it("leaves a player that loaded normally alone", () => {
    document.body.innerHTML = "";
    const idle = player(HTMLMediaElement.NETWORK_IDLE);
    const loading = player(HTMLMediaElement.NETWORK_LOADING);

    reloadFailedMedia(document);

    expect(idle).not.toHaveBeenCalled();
    expect(loading).not.toHaveBeenCalled();
  });
});
