import axios from 'axios';
import ANNOTATION_GEO_JSON_FILE_URL from 'file-loader!../../../../../test-resources/caput-mundi/caput-mundi.config';
import GEO_JSON_FILE_URL from 'file-loader!../../../../../test-resources/caput-mundi/caput-mundi.geojson';
import GPX_FILE_URL from 'file-loader!../../../../../test-resources/caput-mundi/caput-mundi.gpx';
import KML_FILE_URL from 'file-loader!../../../../../test-resources/caput-mundi/caput-mundi.kml';
import KMZ_FILE_URL from 'file-loader!../../../../../test-resources/caput-mundi/caput-mundi.kmz';
import SHP_FILE_URL from 'file-loader!../../../../../test-resources/caput-mundi/caput-mundi.zip';
import MAP_FILE from 'file-loader!../../../../../test-resources/map.config';
import UNSUPPORTED_MAP_FILE from 'file-loader!../../../../../test-resources/unsupportedMap.config';
// const b64toBlob = require('b64-to-blob');
import * as Rx from 'rxjs';

export const getFile = (url, fileName = "file") =>
    Rx.Observable.defer( () => axios.get(url, {
        responseType: 'arraybuffer'
    }))
        .map( res => {
            return new File([new Blob([res.data], {type: res.headers['response-type']})], fileName);
        });

// PDF_FILE: new File(b64toBlob('UEsDBAoAAAAAACGPaktDvrfoAQAAAAEAAAAKAAAAc2FtcGxlLnR4dGFQSwECPwAKAAAAAAAhj2pLQ7636AEAAAABAAAACgAkAAAAAAAAACAAAAAAAAAAc2FtcGxlLnR4dAoAIAAAAAAAAQAYAGILh+1EWtMBy3f86URa0wHLd/zpRFrTAVBLBQYAAAAAAQABAFwAAAApAAAAAAA=', 'application/pdf'), "file.pdf"),
export const getShapeFile = () => getFile(SHP_FILE_URL, "shape.zip");
export const getGpxFile = () => getFile(GPX_FILE_URL, "file.gpx");
export const getKmlFile = () => getFile(KML_FILE_URL, "file.kml");
export const getKmzFile = () => getFile(KMZ_FILE_URL, "file.kmz");
export const getGeoJsonFile = (name = "file.json") => getFile(GEO_JSON_FILE_URL, name);
export const getAnnotationGeoJsonFile = () => getFile(ANNOTATION_GEO_JSON_FILE_URL, "annotation.json");
export const getMapFile = () => getFile(MAP_FILE, "map.json");
export const getUnsupportedMapFile = () => getFile(UNSUPPORTED_MAP_FILE, "unsupportedMap.json");


export default {
    getShapeFile,
    getGpxFile,
    getKmlFile,
    getKmzFile,
    getGeoJsonFile,
    getAnnotationGeoJsonFile,
    getMapFile,
    getUnsupportedMapFile
};
