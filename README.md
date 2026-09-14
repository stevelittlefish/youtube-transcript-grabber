# youtube-transcript-grabber

A simple Chrome extension to grab a YouTube video's transcript, ready to paste into your favourite LLM tool. Less faffing about, more getting on with it.

## Why / what on earth are we doing?

We live in the era of slop. YouTube is filled with slop. Every video must somehow stretch three crumbs of information into twenty minutes of slop.

You see a headline like:

> PARLIAMENT ERUPTS as <insert your guy> DESTROYS the establishment and sends his opponents QUAKING IN FEAR

Twenty minutes later, you discover that <insert your guy> asked the housing minister an awkward question, nobody had an answer, and someone muttered something under their breath. Parliament remains stubbornly unerupted.

I do not have time for this.

## ENTER THE EXTENSION!

Here's the plan:

1. Load the YouTube video.
2. Press the button.
3. The extension opens the video's transcript and copies it to the clipboard. Magic, with permissions.
4. Paste the slop into another slop generation tool, such as ChatGPT. (No offence, Mr. Gippity, I've just called you a slop factory (and sorry for the nested brackets (I do love a good bracket))).
5. Turn twenty minutes of slop into twenty seconds of digestible slop.

Now you have nineteen minutes and forty seconds spare. Spend them typing unnecessarily long, slightly witty instructions into Codex to update your project's README in some trivial and meaningless way.

Like this one. This is the time saving. You're looking at it.

## Office rules

We're building this with a small-office, manager's-on-sabbatical vibe: have a laugh, keep it relaxed, and get shit done. The working rules live in [AGENTS.md](AGENTS.md).

Keep it simple, check that the button actually works, and admit when it doesn't. No Jira ticket is required to confirm that something is broken. No Scrum ceremony will unbreak it. If you need Story Points, this is worth three, or eight, or whatever gets the meeting cancelled.

We do have to use JavaScript, which is a bit of an ordeal. But at least there's no shitty Node server to babysit and no virtualenv to activate. The browser has picked the language for us, saving another twenty minutes of discussing the merits of various programming languages. Please spend those minutes enjoying literally anything else.
