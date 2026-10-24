// The ClientRouter parses the next page with DOMParser and swaps its body in.
// A media element's source is resolved in that parsed document, which has no
// browsing context, so if the swap doesn't happen first the element gives up
// with "no supported source" and stays that way after it joins the page.
// Its controls still render, but play does nothing until a full reload
export function reloadFailedMedia(root: ParentNode = document): void {
  for (const media of root.querySelectorAll<HTMLMediaElement>("audio, video")) {
    if (media.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) media.load();
  }
}
