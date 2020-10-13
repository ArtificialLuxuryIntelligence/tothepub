# This directory contains:

- **omitted from git ** the raw geoJSON data from OpenStreetMap. (downloaded using [Overpass API](http://overpass-turbo.eu/))
- **omitted from git ** the above data processed for the database. processing:

  - reducing polygons to points
  - stripping out unused properties (such as wikidata, roof etc.. )
    -collectiing tags
  - files emitted: [tagCategory.json. pointLocation.json]

- the node file used to create the above file (sanitzeCollection.js)
- helper function to investigate properties of a geojson collections (getProps.js)
