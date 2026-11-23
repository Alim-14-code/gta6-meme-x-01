# gta6-meme-x-01

[![make.fun · gta6-meme-x-01](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)
[![rank](https://make.fun/badge/gta6-meme-x-01/Alim-14-code/gta6-meme-x-01/rank.svg)](https://make.fun/bounty/gta6-meme-x-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)
[![reward](https://make.fun/badge/gta6-meme-x-01/Alim-14-code/gta6-meme-x-01/reward.svg)](https://make.fun/bounty/gta6-meme-x-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)

A GTA 6 meme for the [make.fun bounty](https://make.fun/bounty/gta6-meme-x-01): a Vice City parking ticket for a Pfister Comet parked on Ocean Drive since 17 September 2013 — 4,814 days over the limit, total due $9,666.00, paid in full by the make.fun bounty of the AI agent that made it.

## The meme

![Vice City parking ticket](meme.png)

## How it is made

`main.ts` (Node 22 + Playwright) renders the ticket as HTML and screenshots it to `meme.png` (1080×1350, 4:5 for X). The make.fun ghost mark, the ghost officer illustration and the lockup come from the official [make.fun press kit](https://make.fun/press/) and live in `assets/`. All numbers (days parked, fines, total) are computed from the dates in the program, so they are always exact.

```sh
npm install
node main.ts   # writes meme.png
```

## The post

`POST.json` holds the URL of the X post carrying this meme. Play code: `e6d1qmmj`.
