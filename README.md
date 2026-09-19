# Ghim Moh Bin Watch

DEP5118 ITA3 student prototype by Zhou Jiaxuan. This site explores how one-minute community reports could document overflowing public bins in Ghim Moh Gardens, Singapore.

## Important data notice

The ten records in `data/demo_reports.geojson` are synthetic. They are not observed incidents and their coordinates are not confirmed public-bin locations. Do not use them to assess actual cleanliness or service performance.

## Local preview

Run a static server from this directory, then open its local URL. For example:

```powershell
python -m http.server 5179
```

The map uses Leaflet 1.9.4 and OpenStreetMap standard tiles. It needs an internet connection. Do not bulk download or prefetch tiles; retain visible OSM attribution.

## Live submission integration

The public form is `https://ghim-moh-bin-watch.ushahidi.io/posts/create/2`; the public deployment map is `https://ghim-moh-bin-watch.ushahidi.io/map`. Both are configured in `config.js`. The demo map and the live Ushahidi dataset are intentionally separate so illustrative records cannot be mistaken for community submissions.

The site should not be published as complete until an anonymous visitor can submit a report and see a confirmation message.

## Sources

- HDB, Ghim Moh Centre: https://www.hdb.gov.sg/managing-my-home/living-in-my-community/exploring-my-neighbourhood/explore-my-town/queenstown/ghim-moh-centre
- NEA, feedback guidance: https://feedback.nea.gov.sg/icare/OnlineFeedbackForm.aspx
- People's Association, Ghim Moh Gardens RC: https://www.onepa.gov.sg/rc/ghim-moh-gardens-rc
- OpenStreetMap tile usage policy: https://operations.osmfoundation.org/policies/tiles/
