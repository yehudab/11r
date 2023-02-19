### Gaia GPS to topo-json

1. Download GPX from Gaia
2. Start `simple-gpx` node server
2. Upload to: [simple-gpx](http://localhost:5000)
3. Should immediately download the siplified GPX file. If not, reload the page
4. Upload the simplified GPX file to [opengeo](https://opengeo.tech/maps/gpx-simplify-optimizer/)
5. Adjust number of points until no jugged edges exist (first suggestion: 4 nodes per KM)
6. Download in GeoJSON
7. Rename downloaded file to: `trail-xx.geojson`
8. Add new section in `Israel-trail-map.md` for the new trail number. Make sure to adjust the `data.url`, `mark.href`, and the `format.feature` values
9. Run in command line:

```bash 
geo2topo ~/Downloads/trail-xx.geojson | jq > ~/Dev/11r/public/topojson/trail-xx.topojson
```
