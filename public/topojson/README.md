### Adding a trail section

1. Export the hike's GPX (Health app → profile → Export All Health Data; the routes are in `workout-routes/`)
2. Run:

```bash
npm run trail -- ~/Downloads/route_2026-10-23_1.59pm.gpx 41 --start "צור הדסה" --end "נתיב הל״ה" --post
```

This writes `trail-41.topojson` (about 4 points per km), adds the section to the progress map
(`vega-map.js`) and the total distance (`trailStats.js`), updates `lastUpdate` on the trail map page,
and prints the trail front matter. With `--post` it also creates a draft post with that front matter.

Options:
- `--name "<map name>"`: map title, when it isn't "<start> ל<end>"
- `--dry-run`: only print the stats
- `--points-per-km <n>`: more or less map detail
- `--ascent <m>` / `--descent <m>`: use the Fitness app's (barometric) elevation gain instead of the GPS-based one

Stats are computed the way the older posts were: distance ignores GPS jitter under 10 m (about 8% below the Watch's
own distance), moving time counts 2-minute windows faster than 0.15 m/s, and elevation is smoothed over 4 minutes.

Tests (section 30's original recording against its published map and post): `npm test`
