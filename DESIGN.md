# Trackly design

- Direction: Inset + Liquid Glass, explicitly chosen by the user.
- Navigation: no sidebar; full-width inset canvas, as requested.
- Surfaces: translucent layered panels, reflected top/side highlights, 28px blur and soft depth; muted sage/silver light backdrop, deep blue navy dark backdrop.
- Corners: outer canvas 28px, cards 24px (20px mobile), controls 10px.
- Font: Quicksand (400/500/600/700), shared by headings and body; headings/buttons 700, major totals 700, supporting copy 400/500; tabular numerals for financial values.
- Accent: muted teal in light mode, muted blue in dark mode; `--brand` in src/index.css.
- Dark mode: deep navy liquid glass, subtle blue reflections, soft low-contrast edges.
- Charts: muted shared palette; overview donut, category comparison bars, daily chart stretches with its card on two-column desktop layouts so its bottom edge matches Savings; compact chart height on stacked/mobile layouts (208px / 184px).
- Keep existing financial features, data, languages, and light/dark mode.
- Surface and font tokens: final design block in src/index.css. Tailwind font aliases: tailwind.config.js.
