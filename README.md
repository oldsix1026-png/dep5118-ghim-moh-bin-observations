# Ghim Moh Bin Observations

DEP5118 ITA3 student prototype by Zhou Jiaxuan. This site explores how one-minute community reports could document overflowing public bins in Ghim Moh Gardens, Singapore.

Website: https://oldsix1026-png.github.io/dep5118-ghim-moh-bin-observations/

## Important data notice

The 25 records in `data/demo_reports.geojson` are synthetic observations at 10 illustrative sites across Ghim Moh Gardens, from the Blk 20 market area toward Blk 21. Repeated coordinates demonstrate multiple reports about the same possible bin at similar or different times; they do not represent 25 bins. These are not observed incidents, and their coordinates are not confirmed public-bin locations. Do not use them to assess actual cleanliness or service performance.

## Local preview

Run a static server from this directory, then open its local URL. For example:

```powershell
python -m http.server 5179
```

The map uses Leaflet 1.9.4 and OpenStreetMap standard tiles. It needs an internet connection. Do not bulk download or prefetch tiles; retain visible OSM attribution.

Each marker aggregates reports by `site_id`. Its centre number and size show the number of reports; coloured sectors show their condition mix. Click a marker or a site in the list for the dated observations. Condition and time-of-day filters recalculate these summaries from the matching records.

## Live submission integration

The public form is `https://ghim-moh-bin-watch.ushahidi.io/posts/create/2`; the public deployment map is `https://ghim-moh-bin-watch.ushahidi.io/map`. Both are configured in `config.js`. The same 25 examples have been imported into Ushahidi from `data/ushahidi_import_25.csv`. Every imported title and note identifies the record as simulated; their example observation times are in the notes, while Ushahidi's post timestamps reflect the import date. The local demo map remains separate from the live Ushahidi data feed.

The site should not be published as complete until an anonymous visitor can submit a report and see a confirmation message.

## Sources

- HDB, Ghim Moh Centre: https://www.hdb.gov.sg/managing-my-home/living-in-my-community/exploring-my-neighbourhood/explore-my-town/queenstown/ghim-moh-centre
- NEA, feedback guidance: https://feedback.nea.gov.sg/icare/OnlineFeedbackForm.aspx
- People's Association, Ghim Moh Gardens RC: https://www.onepa.gov.sg/rc/ghim-moh-gardens-rc
- OpenStreetMap tile usage policy: https://operations.osmfoundation.org/policies/tiles/
