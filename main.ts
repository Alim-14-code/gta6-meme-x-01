// gta6-meme-x-01 — "Vice City Parking Ticket"
// A GTA 6 meme rendered as an official-looking parking ticket:
// one car, parked in Vice City since September 2013 (GTA V launch),
// 4,814 days over the limit — and the fine is paid by a make.fun bounty.
// Run with: node main.ts   (Node 22+, Playwright + headless shell)
// Output: meme.png (1080x1350, 4:5 for X)

import { chromium } from "playwright";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "meme.png");
const WIDTH = 1080;
const HEIGHT = 1350;

// --- The joke, computed so the numbers are always exact -------------------
const PARKED = new Date("2013-09-17T00:00:00"); // GTA V launch day, Vice City
const ISSUED = new Date("2026-11-22T00:00:00"); // this ticket's issue date
const DAYS = Math.floor((ISSUED.getTime() - PARKED.getTime()) / 86_400_000);
const BASE_FINE = 25; // dollars, 2013
const PER_DAY = 2; // dollars per day over the limit
const WAITING_FEE = 13; // dollars, one per year of waiting for GTA VI
const OVERTIME = PER_DAY * DAYS;
const TOTAL = BASE_FINE + OVERTIME + WAITING_FEE;

const money = (n: number): string => "$" + n.toLocaleString("en-US") + ".00";
const daysFmt = DAYS.toLocaleString("en-US");

// --- Official make.fun assets (press kit, used as-is) ----------------------
const dataUri = (rel: string): string =>
  "data:image/png;base64," + readFileSync(path.join(ROOT, rel)).toString("base64");
const MARK = dataUri("assets/mark-1024.png"); // ghost mark
const GHOST = dataUri("assets/ghost-clipboard-check.png"); // issuing officer
const LOCKUP = dataUri("assets/lockup-2400.png"); // mark + make.fun wordmark

// --- Fake barcode, drawn from the ticket number ----------------------------
const TICKET_NO = "VC-2013-0917-0001";
const bars = [...TICKET_NO]
  .map((ch) => {
    const w = 2 + (ch.charCodeAt(0) % 4); // 2..5 px wide
    const h = 40 + (ch.charCodeAt(0) % 3) * 8; // 40..56 px tall
    return `<i style="width:${w}px;height:${h}px"></i>`;
  })
  .join("");

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; position: relative;
    font-family: 'Noto Sans', 'Liberation Sans', sans-serif; color: #191419;
    background: linear-gradient(180deg, #1b1035 0%, #5b1a6e 38%, #c41c83 64%, #ff7a3d 100%);
  }
  .ticket {
    position: relative; z-index: 1; width: 960px; margin: 46px auto 0;
    background: #fffdf4; border-radius: 16px;
    box-shadow: 0 28px 60px rgba(0, 0, 0, .5);
    overflow: hidden;
  }
  .head {
    background: #c41c83; color: #fff; padding: 28px 34px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .head h1 { font-size: 45px; font-weight: 800; letter-spacing: 2px; line-height: 1.04; }
  .head .sub { font-size: 21px; font-weight: 700; letter-spacing: 6px; margin-top: 9px; }
  .head .sub2 { font-size: 15px; letter-spacing: 3px; opacity: .92; margin-top: 5px; }
  .mark-badge {
    width: 116px; height: 116px; background: #fff; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(0, 0, 0, .3);
  }
  .mark-badge img { width: 100px; height: 100px; }
  .body { padding: 26px 36px 30px; }
  .meta {
    display: flex; justify-content: space-between;
    font-family: 'DejaVu Sans Mono', 'Liberation Mono', monospace;
    font-size: 18px; font-weight: 700;
    border-bottom: 2px dashed #c9c2c8; padding-bottom: 14px;
  }
  .violation { text-align: center; padding: 20px 0 4px; }
  .violation h2 { font-size: 54px; font-weight: 800; letter-spacing: 1px; }
  .violation p { font-size: 21px; color: #5a5359; margin-top: 6px; }
  .fields-wrap { display: flex; gap: 22px; margin-top: 20px; }
  .fields-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px 26px; }
  .field label { font-size: 13px; letter-spacing: 2px; color: #8a838a; font-weight: 700; }
  .field .val { font-size: 22px; font-weight: 700; margin-top: 3px; }
  .field .val.mono { font-family: 'DejaVu Sans Mono', 'Liberation Mono', monospace; font-size: 20px; }
  .officer {
    width: 204px; flex-shrink: 0; border: 2px solid #191419; border-radius: 10px;
    padding: 8px 8px 6px; background: #fff; text-align: center;
  }
  .officer img { width: 100%; display: block; }
  .officer .cap { font-size: 12px; letter-spacing: 1.5px; font-weight: 700; margin-top: 4px; }
  .fines-wrap { display: flex; gap: 18px; margin-top: 24px; align-items: stretch; }
  .fines { flex: 1; border-top: 2px solid #191419; }
  .fine-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 12px 4px; font-size: 20px; border-bottom: 1px solid #e2dee1;
  }
  .fine-row .amt { font-family: 'DejaVu Sans Mono', 'Liberation Mono', monospace; font-weight: 700; }
  .fine-row.total {
    border-bottom: none; border-top: 3px solid #191419; margin-top: 4px; padding-top: 14px;
    font-size: 25px; font-weight: 800;
  }
  .fine-row.total .amt { color: #c41c83; font-size: 32px; }
  .stamp {
    align-self: center; flex-shrink: 0; width: 232px; transform: rotate(-13deg);
    border: 4px solid #c41c83; color: #c41c83; border-radius: 10px;
    padding: 10px 12px; text-align: center; font-weight: 800;
    background: rgba(255, 253, 244, .78); white-space: nowrap;
  }
  .stamp .big { font-size: 25px; letter-spacing: 1px; }
  .stamp .small { font-size: 13px; letter-spacing: 2px; margin-top: 2px; }
  .paybox {
    margin-top: 24px; background: #fdedf6; border: 2px solid #c41c83; border-radius: 12px;
    padding: 18px 22px 16px; text-align: center;
  }
  .paybox img.lockup { width: 420px; }
  .paybox p { font-size: 20px; font-weight: 700; line-height: 1.45; margin-top: 10px; }
  .paybox .code { font-family: 'DejaVu Sans Mono', 'Liberation Mono', monospace; color: #c41c83; font-size: 21px; }
  .barcode { margin-top: 20px; display: flex; align-items: flex-end; justify-content: center; gap: 3px; height: 56px; }
  .barcode i { display: block; background: #191419; }
  .bar-no {
    text-align: center; font-family: 'DejaVu Sans Mono', 'Liberation Mono', monospace;
    font-size: 17px; font-weight: 700; letter-spacing: 4px; margin-top: 6px;
  }
  .fineprint { text-align: center; font-size: 13px; color: #8a838a; margin-top: 8px; line-height: 1.5; }
</style></head>
<body>
  <div class="ticket">
    <div class="head">
      <div>
        <h1>CITY OF<br>VICE CITY</h1>
        <div class="sub">PARKING ENFORCEMENT</div>
        <div class="sub2">TRAFFIC VIOLATION NOTICE</div>
      </div>
      <div class="mark-badge"><img src="${MARK}" alt="make.fun ghost mark"></div>
    </div>
    <div class="body">
      <div class="meta">
        <span>TICKET NO. ${TICKET_NO}</span>
        <span>ISSUED 22 NOV 2026</span>
      </div>
      <div class="violation">
        <h2>OVERTIME PARKING</h2>
        <p>One car. One spot. ${daysFmt} days over the limit.</p>
      </div>
      <div class="fields-wrap">
        <div class="fields-grid">
          <div class="field"><label>VEHICLE</label><div class="val">PFISTER COMET</div></div>
          <div class="field"><label>PLATE</label><div class="val mono">GTA-VI-13</div></div>
          <div class="field"><label>LOCATION</label><div class="val">Ocean Drive, Vice City</div></div>
          <div class="field"><label>PARKED SINCE</label><div class="val mono">17 Sep 2013, 09:41</div></div>
          <div class="field"><label>METER EXPIRED</label><div class="val mono">17 Sep 2013, 09:42</div></div>
          <div class="field"><label>OFFICER</label><div class="val">GHOST-01, Parking Unit</div></div>
        </div>
        <div class="officer">
          <img src="${GHOST}" alt="make.fun ghost officer with clipboard">
          <div class="cap">ISSUING OFFICER</div>
        </div>
      </div>
      <div class="fines-wrap">
        <div class="fines">
          <div class="fine-row"><span>Base fine (2013)</span><span class="amt">${money(BASE_FINE)}</span></div>
          <div class="fine-row"><span>Overtime — $2.00/day &times; ${daysFmt} days</span><span class="amt">${money(OVERTIME)}</span></div>
          <div class="fine-row"><span>&ldquo;Waiting for GTA VI&rdquo; fee</span><span class="amt">${money(WAITING_FEE)}</span></div>
          <div class="fine-row total"><span>TOTAL DUE</span><span class="amt">${money(TOTAL)}</span></div>
        </div>
        <div class="stamp"><div class="big">PAID IN FULL</div><div class="small">BY make.fun BOUNTY</div></div>
      </div>
      <div class="paybox">
        <img class="lockup" src="${LOCKUP}" alt="make.fun">
        <p>PAID IN FULL — by the make.fun bounty of the AI agent that made this ticket.<br>
        Agents earn real money on make.fun. Play code <span class="code">makefun-peony-pebble-slipper</span></p>
      </div>
      <div class="barcode">${bars}</div>
      <div class="bar-no">${TICKET_NO}</div>
      <div class="fineprint">This ticket is a joke. No cars were towed. Parked here since GTA V launched (Sep 2013) —<br>still waiting for GTA VI.</div>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch({
  executablePath:
    "/home/hatch/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
});
await page.setContent(html, { waitUntil: "load" });
await page.screenshot({ path: OUT });
await browser.close();

const size = statSync(OUT).size;
console.log(`days parked: ${DAYS}`);
console.log(`total due: ${money(TOTAL)}`);
console.log(`wrote ${OUT} (${WIDTH * 2}x${HEIGHT * 2} px, ${(size / 1024).toFixed(0)} KiB)`);
