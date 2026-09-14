const status = document.getElementById("status");
const transcript = document.getElementById("transcript");
const copy = document.getElementById("copy");
const retry = document.getElementById("retry");
let text = "";

async function copyTranscript() {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = "Copied. Paste it into your favourite slop compressor.";
    transcript.hidden = true;
    copy.hidden = false;
    copy.textContent = "Copy again";
  } catch {
    status.textContent = "Automatic copy didn't work. Press Copy transcript, or select the text below and copy it yourself.";
    transcript.value = text;
    transcript.hidden = false;
    copy.hidden = false;
    copy.textContent = "Copy transcript";
    transcript.focus();
    transcript.select();
  }
}

async function run() {
  retry.hidden = true;
  copy.hidden = true;
  transcript.hidden = true;
  text = "";
  status.textContent = "Opening the transcript… Keep this popup open for a moment.";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab?.url || "about:blank");
    if (url.hostname !== "www.youtube.com" || url.pathname !== "/watch" || !url.searchParams.get("v")) {
      throw new Error("Open a YouTube video first. This button needs some slop to work with.");
    }
    const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: grabTranscript });
    if (result?.error) throw new Error(result.error.message || "YouTube couldn't open the transcript. Try again.");
    if (!result?.result?.text) throw new Error("No transcript came back. Open ‘Show transcript’ on the video and try again.");
    text = result.result.text;
    await copyTranscript();
  } catch (error) {
    status.textContent = error.message || "Something went wrong grabbing the transcript. Try again.";
    retry.hidden = false;
  }
}

copy.addEventListener("click", copyTranscript);
retry.addEventListener("click", run);
run();
