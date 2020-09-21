# This directory contains:

- the raw geoJSON data from OpenStreetMap. (downloaded using [Overpass API](http://overpass-turbo.eu/))
- the above data processed for the database. processing:
  - reducing polygons to points
  - stripping out unused properties (such as wikidata, roof etc.. )
- the node file used to create the above file
