# Selecting trail photos for the maps

How to get photos from the Photos library onto the `/maps/trail-NN/` pages. Exported photos
wait outside the repo until they're selected in an editor that only exists on the dev server.
Only the keepers enter the repo.

Section 32 went through this process, so it can serve as the example.

## One-time setup on a new Mac

1. Photos > Settings > iCloud: choose **Download Originals to this Mac**, and wait for the
   download to finish. Photos kept only in iCloud are listed but can't be exported.
2. Give the terminal **Full Disk Access** (System Settings > Privacy & Security), which is needed
   to read the library.
3. Install `exiftool` (`brew install exiftool`) and the repo's dependencies (`npm install`).
4. Export all data from the Health app and save the zip as `~/Downloads/health-export.zip`. Its recorded
   routes give each hike's times and place photos that have no GPS. Without it, the script goes
   by the photos alone.

## For each section

Run everything from the repo root. Leave out `--section` to export all the sections.

1. **Export**

   ```
   python3 tools/find-trail-originals.py --section 32 --export
   ```

   Check that the table shows `cloud-only` 0 and that the last lines show 0 failed. Photos go to
   `~/Downloads/trail-originals/section-32/` as JPEGs with a long side of 1280 px, tagged with
   their best location. Photos already in a post are skipped, and so are files already exported,
   so it's safe to run again.

2. **Start, or restart, the dev server**

   ```
   npm run dev
   ```

   It only looks for exported photos when it starts.

3. **Select**

   Open <http://localhost:8080/maps/trail-32/>. Use `localhost`: saving is refused from any other
   address. Click a photo, then ✅ to keep it or 🗑️ to drop it. Click the active button again to
   undo. Each click is saved right away to `tools/trail/photo-decisions.json`.

   | Thumbnail | Meaning |
   |---|---|
   | Dashed amber border | Not decided yet |
   | Green border | Keep |
   | Faded and grey | Trash |
   | White border | Already on the blog |

   Click a group to zoom in or spread it out. A group's cover is a kept or published photo, or
   else an undecided one, so a group with a trashed cover has nothing left to decide.

4. **Publish the keepers**

   ```
   npm run trail:keepers
   ```

   This copies them here as `img/YYYY/MM/shvil-NN-K.jpg` in order of capture, and lists them in
   `tools/trail/map-photos.json`. It's safe to run again.

5. **Check production**, with the dev server stopped

   ```
   npm run build
   npx serve dist -l 3000
   ```

   Open <http://localhost:3000/maps/trail-32/>. The buttons, candidates and trashed photos should
   all be gone.

6. **Commit** the new photos, `tools/trail/map-photos.json` and `tools/trail/photo-decisions.json`.
   Production builds need the decisions file to leave out trashed photos.

## Good to know

- **Keepers appear on the map only.** They have no caption or link to a post. To use one in a
  post, reference its `img/` path as usual: it stays on the map once, with the post's caption.
- **🗑️ on a photo in a post only removes it from the map.** To remove it from the post, edit the post.
- **Changing your mind after publishing:** 🗑️ on a published keeper removes it from the production
  map, but its file stays in `img/` until you delete it and its entry in `map-photos.json`.
  Publishing a photo you first trashed works normally.
- **A photo with no location is left out of the map,** with a warning in the dev server's output.
  This happens when it has no GPS and no recorded route covers the time it was taken.
- **A hike's published photo can reappear as a candidate** if the script couldn't match it to its
  original. The script lists those at the end of its output. Just trash the duplicate, or give the
  script a folder of copies that still have their metadata with `--reference DIR`.
- **`~/Downloads/trail-originals` can be deleted** once a section is published and committed.
  Exporting again recreates it. To keep it elsewhere, pass `--out DIR` to the script and set
  `TRAIL_BACKFILL_DIR` for the dev server.
