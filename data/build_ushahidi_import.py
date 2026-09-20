"""Build a clearly labelled Ushahidi CSV from the local example observations."""

import csv
import json
from datetime import datetime
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parent
source = json.loads((DATA_DIR / "demo_reports.geojson").read_text(encoding="utf-8"))
features = source["features"]
assert len(features) == 25

conditions = {
    "near-full": "Nearly full",
    "full": "Full",
    "outside": "Litter outside the bin",
}

rows = []
for feature in features:
    props = feature["properties"]
    longitude, latitude = feature["geometry"]["coordinates"]
    observed = datetime.fromisoformat(props["reportedAt"])
    rows.append(
        {
            "Title": f"SIMULATED EXAMPLE {props['id']}",
            "Observation note (prefilled)": (
                "SIMULATED EXAMPLE for DEP5118; not a real incident or a confirmed bin location. "
                f"Example site: {props['site_id']} ({props['place']}). "
                f"Example observation time: {observed:%d %b %Y, %H:%M} SGT. "
                f"Example condition: {conditions[props['status']]}."
            ),
            "Latitude": latitude,
            "Longitude": longitude,
            "What did you see?": conditions[props["status"]],
        }
    )

output = DATA_DIR / "ushahidi_import_25.csv"
with output.open("w", encoding="utf-8-sig", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)

assert len({(row["Latitude"], row["Longitude"]) for row in rows}) == 10
print(f"Wrote {len(rows)} labelled examples at 10 sites to {output}")
