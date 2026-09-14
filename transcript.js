// This function runs in the active YouTube tab, so keep its helpers inside it.
async function grabTranscript() {
  const videoId = new URL(location.href).searchParams.get("v");
  if (location.hostname !== "www.youtube.com" || location.pathname !== "/watch" || !videoId) {
    throw new Error("Open a video on www.youtube.com first, then grab its transcript.");
  }

  const visible = (element) => element && element.getClientRects().length > 0;
  const panelSelector = 'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"], ytd-engagement-panel-section-list-renderer [data-target-id="PAmodern_transcript_view"]';
  const panel = () => [...document.querySelectorAll(panelSelector)].find(visible);
  const read = () => {
    const root = panel();
    if (!root) return "";
    const lines = root.querySelectorAll('ytd-transcript-segment-renderer .segment-text, transcript-segment-view-model .ytwTranscriptSegmentViewModelText, transcript-segment-view-model > span[role="text"]');
    return [...lines].map((line) => line.textContent.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
  };
  const ensureSameVideo = () => {
    if (location.pathname !== "/watch" || new URL(location.href).searchParams.get("v") !== videoId) {
      throw new Error("The video changed while grabbing. Try again on the new video.");
    }
  };
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const deadline = Date.now() + 15000;
  let nextClick = 0;
  let expanded = false;
  let previous = "";
  let stableSince = 0;

  while (Date.now() < deadline) {
    ensureSameVideo();
    const text = read();
    if (text) {
      // Give the panel time to finish rendering rather than copying its first row.
      if (text !== previous) {
        previous = text;
        stableSince = Date.now();
      } else if (Date.now() - stableSince >= 1000) {
        return { text, lines: text.split("\n").length };
      }
    } else {
      previous = "";
      if (!panel() && Date.now() >= nextClick) {
        if (!expanded) {
          const more = document.querySelector("ytd-watch-metadata #description-inline-expander #expand");
          if (visible(more)) {
            more.click();
            expanded = true;
            await sleep(200);
            continue;
          }
        }
        // The renderer selector works independently of YouTube's display language.
        const button = [...document.querySelectorAll(
          'ytd-video-description-transcript-section-renderer button, ytd-video-description-transcript-section-renderer [role="button"]'
        )].find(visible);
        if (button) {
          button.click();
          nextClick = Date.now() + 1500;
        }
      }
    }
    await sleep(200);
  }
  throw new Error("Couldn't load a transcript. The video may not have one, or YouTube may have changed its layout. Try opening ‘Show transcript’ manually, then try again.");
}
