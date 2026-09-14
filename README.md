# youtube-transcript-grabber

A simple Chrome extension to grab a YouTube video's transcript, ready to paste into your favourite LLM tool. Less faffing about, more getting on with it.

## Why / what on earth are we doing?

We live in the era of slop. YouTube is filled with slop. Every video must somehow stretch three crumbs of information into twenty minutes of slop.

You see a headline like:

> PARLIAMENT ERUPTS as <insert your guy> DESTROYS the establishment and sends his opponents QUAKING IN FEAR

Twenty minutes later, you discover that <insert your guy> asked the housing minister an awkward question, nobody had an answer, and someone muttered something under their breath. Parliament remains stubbornly unerupted.

I do not have time for this.

## ENTER THE EXTENSION!

Here's the flow:

1. Load the YouTube video.
2. Press the button.
3. The extension opens the video's transcript and copies it to the clipboard. Magic, with permissions.
4. Paste the slop into another slop generation tool, such as ChatGPT. (No offence, Mr. Gippity, I've just called you a slop factory (and sorry for the nested brackets (I do love a good bracket))).
5. Turn twenty minutes of slop into twenty seconds of digestible slop.

Now you have nineteen minutes and forty seconds spare. Spend them typing unnecessarily long, slightly witty instructions into Codex to update your project's README in some trivial and meaningless way.

Like this one. This is the time saving. You're looking at it.

## Install it

No build step. No dependencies. No summoning npm from the cellar.

1. Download this repository and unzip it, or clone it.
2. Open `brave://extensions` (or `chrome://extensions` if that's your thing).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Pin **YouTube Transcript Grabber** using the browser's extensions menu.

Open a normal YouTube video page and click the extension's toolbar button. Keep the popup open while it grabs the transcript; it will tell you when the text is copied. Paste wherever you like. If automatic copying fails, the popup offers a copy button and selectable text.

The extension copies transcript text without timestamps, in the language currently selected in YouTube's transcript panel. It doesn't summarise anything itself. Videos without transcripts won't magically acquire one, and Shorts and embedded players aren't supported. If YouTube changes its layout, try opening **Show transcript** yourself and clicking the extension again.

After pulling an update, click **Reload** on the extension's card in `brave://extensions`.

## What's it allowed to do?

It uses `activeTab` and `scripting` to open and read the transcript on the video you invoke it on, plus `clipboardWrite` to copy the result. Those are [Chrome's extension permissions](https://developer.chrome.com/docs/extensions/reference/permissions-list), also used by Brave. No background service, analytics, storage, or automatic sending to an LLM. You choose where to paste the text.

## Checks, without a Scrum ceremony

Optional developer checks: `node tests/transcript.test.cjs`. These cover extraction, missing transcripts, navigation, popup errors, and clipboard fallback using fixtures. Node is only the test runner; the extension itself needs nothing installed beyond your browser.

For a browser check, try a video with captions, an already-open transcript, a video without captions, and a non-YouTube tab. Confirm that pasting produces the complete transcript without timestamps. Fixture checks can't promise that YouTube hasn't moved the furniture again.

## Office rules

We're building this with a small-office, manager's-on-sabbatical vibe: have a laugh, keep it relaxed, and get shit done. The working rules live in [AGENTS.md](AGENTS.md).

Keep it simple, check that the button actually works, and admit when it doesn't. No Jira ticket is required to confirm that something is broken. No Scrum ceremony will unbreak it. If you need Story Points, this is worth three, or eight, or whatever gets the meeting cancelled.

We do have to use JavaScript, which is a bit of an ordeal. But at least there's no shitty Node server to babysit and no virtualenv to activate. The browser has picked the language for us, saving another twenty minutes of discussing the merits of various programming languages. Please spend those minutes enjoying literally anything else.

## FAQ

**Why not a Firefox extension?**

Who the fuck uses Firefox?
