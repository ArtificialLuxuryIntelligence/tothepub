# Take me to the pub

A pub finding web application. Using the current location of the user, the application finds local drinking establishments which are then presented to the user on an interactive map.

[Live demo](booze.netlify.app) (requires geolocation and UK only)

## Features

- Search by tag name (e.g. "food", "craft-beer", "Samuel Smith" etc)
- Walking directions from current location to selected pub
- Search from a different starting point

## Table of contents

- [Overview](#overview)
- [Client](#client)
- [Data](#data)
- [Server](#server)
- [Future](#future)

# Overview

The basic structure of the application is as follows:

- The database (MongoDB) holds:
  - location data in geoJSON format.
  - tag information grouped by category (e.g. pub operators)
- The client queries the database (via the API on server) in order to get the relevant local location info.
- The client displays this location data on an interactive map using MapboxGL

# Client

The client uses Mapbox GL for showing the local pub locations. Since this is the primary use of the application, the site was built without any front-end framework. HTML, JS, SCSS.

- On load the application requires user geolocation data. Using this location, the API is used to return all of the tags which are available in the local area.
- The user can choose to filter the results of the search based on these tags
- The search results in an API call which returns all local locations fitting the search criteria which are then displayed on the map rendered by Mapbox.
- The locations are represented by markers which can be expanded to either see more information about the location or even edited. (note: edited locations are verified by an admin before being updated.)
- Custom map controls:
  - Walking directions to selected locations.
  - Teleport - allows user to search from locations which are not current geolocation.
  - Toggle dark mode

# Server

Provides the API. An Express server (connected to MongoDB) that provides the client with the API for accessing local location and tag data. Admin routes: provides routes for updating locations and adding new tags.

This folder also includes the script for seeding the intial database (./database). See [Data](#data) for more information.

# Data

This folder contains files used to manipulate the [OSM data](https://wiki.openstreetmap.org/wiki/Main_Page) to make seed files for the MongoDB.
(\*) Not included in git

- (\*) **rawdata** the raw geoJSON data from OpenStreetMap. (downloaded using [Overpass API](http://overpass-turbo.eu/))

  - example query "pubs in greater"

- **sanitzeCollection.js** node file used to create the seed files for the database.
  - reduces raw geoJSON collection by:
    - reducing polygon locations to single points of interest.
    - strips out unwanted properties (e.g. "roof", "wikidata")
    - extracts all relevant tag data
  - Creates seed files:
    - pointLocation.json
    - tagCategory.json
- **getProps.js** helper node file used to investigate properties of a geojson collections

# Future

The project is ongoing and requires some tweaks before being production ready:

### Security :

- Admin routes are currently unprotected...! Authentication system required here.
- Sanitizing user input
- Sanitizing raw geoJSON data (URLs are possibly an issue)

### Improvements

#### Client

1. The project needs some additional pages: about and contact.
2. The current implementation does not let allow you to reselect tags when on the map page.
3. Refine design for larger screen sizes.

#### Data

1. Since this project uses OSM data and the idea is that this dataset improves as users edit and update locations, a way of feeding the improved dataset back into OSM would be a great way of contributing to the excellent project that is OSM. Updated locations are already currently tracked.
2. Possibly as an alternative to the above: Merge a new OSM dataset with existing dataset whilst keeping all of the the edits made in this app.
