const HYBRID = require('../plugins/background/assets/img/HYBRID.jpg');
const ROADMAP = require('../plugins/background/assets/img/ROADMAP.jpg');
const TERRAIN = require('../plugins/background/assets/img/TERRAIN.jpg');
const SATELLITE = require('../plugins/background/assets/img/SATELLITE.jpg');
// const Aerial = require('../plugins/background/assets/img/Aerial.jpg');
const mapnik = require('../plugins/background/assets/img/mapnik.jpg');
// const mapquestOsm = require('../plugins/background/assets/img/mapquest-osm.jpg');
const empty = require('../plugins/background/assets/img/none.jpg');
// const unknown = require('../plugins/background/assets/img/dafault.jpg');
const Night2012 = require('../plugins/background/assets/img/NASA_NIGHT.jpg');
// const AerialWithLabels = require('../plugins/background/assets/img/AerialWithLabels.jpg');
const OpenTopoMap = require('../plugins/background/assets/img/OpenTopoMap.jpg');

const {head} = require('lodash');

const backgounds = [
    {
        "id": "bg_empty",
        "source": "ol",
        "group": "background",
        "title": "Empty Background",
        "fixed": true,
        "type": "empty",
        "visibility": false,
        "thumbUrl": empty,
        "args": [
          "Empty Background", {
            "visibility": false
          }
        ]
    },
    {
        "id": "bg_osm",
        "type": "osm",
        "title": "Open Street Map",
        "name": "mapnik",
        "source": "osm",
        "group": "background",
        "visibility": true,
        "thumbUrl": mapnik
    },
    {
        "id": "bg_nasa_night",
        "type": "tileprovider",
        "title": "NASAGIBS Night 2012",
        "provider": "NASAGIBS.ViirsEarthAtNight2012",
        "name": "Night2012",
        "source": "nasagibs",
        "group": "background",
        "visibility": false,
        "thumbUrl": Night2012
    },
    {
        "id": "bg_topo",
        "type": "tileprovider",
        "title": "OpenTopoMap",
        "provider": "OpenTopoMap",
        "name": "OpenTopoMap",
        "source": "OpenTopoMap",
        "group": "background",
        "visibility": false,
        "thumbUrl": OpenTopoMap
    },
    {
        "id": "bg_google_hybrid",
        "type": "google",
        "title": "Google HYBRID",
        "name": "HYBRID",
        "source": "google",
        "group": "background",
        "visibility": false,
        "thumbUrl": HYBRID
    },
    {
        "id": "bg_google_roadmap",
        "type": "google",
        "title": "Google ROADMAP",
        "name": "ROADMAP",
        "source": "google",
        "group": "background",
        "visibility": false,
        "thumbUrl": ROADMAP
    },
    {
        "id": "bg_google_satellite",
        "type": "google",
        "title": "Google SATELLITE",
        "name": "SATELLITE",
        "source": "google",
        "group": "background",
        "visibility": false,
        "thumbUrl": SATELLITE
    },
    {
        "id": "bg_google_terrain",
        "type": "google",
        "title": "Google TERRAIN",
        "name": "TERRAIN",
        "source": "google",
        "group": "background",
        "visibility": false,
        "thumbUrl": TERRAIN
    }
];
const getRecords = (url, startPosition, maxRecords, text, options, layers) => {

    const filteredBg = backgounds.filter(bg => !head(layers.filter(layer => layer.type === bg.type && layer.source === bg.source && layer.name === bg.name)));
    const textBg = filteredBg.filter(bg => !text || bg.title.indexOf(text) > -1);
    return new Promise((resolve) => {
        return resolve({
            numberOfRecordsMatched: textBg.length,
            numberOfRecordsReturned: 4,
            records: textBg.filter((bg, idx) => idx >= startPosition - 1 && idx < maxRecords + startPosition - 1),
            service: {
                Name: 'Background Provider'
            }

        });
    });
};

const reset = () => {};
module.exports = {
    getRecords,
    reset,
    textSearch: (url, startPosition, maxRecords, text, options, layers) => getRecords(url, startPosition, maxRecords, text, options, layers)
};
