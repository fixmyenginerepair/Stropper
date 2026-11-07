# Legacy archive — the original stropper.com

This folder is the read-only home of the original site: the PHP, HTML, CSS,
JavaScript/Java and SQL that ran stropper.com before the archive was rebuilt.

**Nothing in here is ever edited.** Files are added once, exactly as they were
recovered from the original server, and left alone. Fixes and improvements
belong in the new application (`src/`), never here.

## Layout

```
legacy/
  README.md            this file
  php/                 the original PHP source (site pages, includes, includes/db config)
  html/                static HTML and page templates
  css/                 stylesheets
  javascript/          scripts shipped with the site
  java/               applets or Java sources, if any
  sql/                 MySQL schema and data dumps — the master copy of the data
  pictures/            the original /home/pictures image library
  notes/               collector correspondence, handover notes, change history
```

## What "the master copy of the data" means

`sql/` holds the authoritative dump of the original database — 1,906 catalogued
sharpeners with every field as it was entered by hand: maker and address,
country, patent, blade, comment, rarity, estimated value and collector ID.
The new application is built from that dump; the dump itself is never modified.

If the two ever disagree, the dump wins and the new application is corrected.

## Adding to it

Files are attached through the site's **Classic Stropper → Archive register**
page, which stores each master copy privately and records its original path,
size and SHA-256 checksum. That way every artefact in this folder has a verified
counterpart even if this repository is ever lost.

Do not rename or reorganise recovered files: their original paths are what make
them traceable to the old server.