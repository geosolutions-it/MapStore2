

// const b64toBlob = require('b64-to-blob');
const Rx = require('rxjs');
const axios = require('axios');
const SHP_FILE_URL = require('file-loader!../../../../../test-resources/caput-mundi/caput-mundi.zip');
const GPX_FILE_URL = require('file-loader!../../../../../test-resources/caput-mundi/caput-mundi.gpx');
const KMZ_FILE_URL = require('file-loader!../../../../../test-resources/caput-mundi/caput-mundi.kmz');
const KML_FILE_URL = require('file-loader!../../../../../test-resources/caput-mundi/caput-mundi.kml');
const GEO_JSON_FILE_URL = require('file-loader!../../../../../test-resources/caput-mundi/caput-mundi.geojson');
const MAP_FILE = require('file-loader!../../../../../test-resources/map.json');
const getFile = (url, fileName = "file") =>
        Rx.Observable.defer( () => axios.get(url, {
            responseType: 'arraybuffer'
        }))
        .map( res =>
            new File([new Blob([res.data], {type: res.headers['response-type']})], fileName)
        );

module.exports = {
    // PDF_FILE: new File(b64toBlob('UEsDBAoAAAAAACGPaktDvrfoAQAAAAEAAAAKAAAAc2FtcGxlLnR4dGFQSwECPwAKAAAAAAAhj2pLQ7636AEAAAABAAAACgAkAAAAAAAAACAAAAAAAAAAc2FtcGxlLnR4dAoAIAAAAAAAAQAYAGILh+1EWtMBy3f86URa0wHLd/zpRFrTAVBLBQYAAAAAAQABAFwAAAApAAAAAAA=', 'application/pdf'), "file.pdf"),
    getShapeFile: () => getFile(SHP_FILE_URL, "shape.zip"),
    getGpxFile: () => getFile(GPX_FILE_URL, "file.gpx"),
    getKmlFile: () => getFile(KML_FILE_URL, "file.kml"),
    getKmzFile: () => getFile(KMZ_FILE_URL, "file.kmz"),
    getGeoJsonFile: (name = "file.json") => getFile(GEO_JSON_FILE_URL, name),
    getMapFile: () => getFile(MAP_FILE, "map.json")
};
