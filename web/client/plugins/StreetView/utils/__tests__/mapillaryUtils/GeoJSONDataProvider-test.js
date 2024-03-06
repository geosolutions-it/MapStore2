/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import GeoJSONDataProvider from '../../mapillaryUtils/GeoJSONDataProvider';

describe('Mapillary GeoJSONDataProvider', () => {

    it('test GeoJSONDataProvider', () => {
        let options = {};
        let pathURL = "base/web/client/test-resources/mapillary/output/run_04/index.json";
        let geoJsonSample = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            9.0327347,
                            44.3834013,
                            52.621
                        ]
                    },
                    "properties": {
                        "filename": "01916-1665045163-2022-10-06-08-32-43-889",
                        "md5sum": "b44289b035343cc4eebd23c57ec36309",
                        "filetype": "image",
                        "MAPLatitude": 44.3834013,
                        "MAPLongitude": 9.0327347,
                        "MAPCaptureTime": "2022_10_06_10_32_43_000",
                        "MAPAltitude": 52.621,
                        "MAPCompassHeading": {
                            "TrueHeading": 1.08,
                            "MagneticHeading": 1.08
                        },
                        "MAPSequenceUUID": "0",
                        "MAPDeviceMake": "NCTECH LTD",
                        "MAPDeviceModel": "iSTAR Pulsar",
                        "MAPOrientation": 1,
                        "width": 11000,
                        "height": 5500,
                        "extension": ".jpg"
                    }
                }
            ]
        };
        let geojsonDataProviderObj = new GeoJSONDataProvider({
            url: pathURL,
            geometryLevel: options?.geometryLevel || 14,
            geojson: geoJsonSample,
            debug: !!options?.debugTiles,
            getImageFromUrl: options?.getImageFromUrl
        });
        expect(geojsonDataProviderObj).toExist();
        expect(geojsonDataProviderObj._features?.length).toEqual(1);
        expect(geojsonDataProviderObj._url).toEqual(pathURL);
    });
});
