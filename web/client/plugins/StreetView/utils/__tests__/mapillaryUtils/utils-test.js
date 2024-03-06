/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { debugTiles, getCellGridCollection } from '../../mapillaryUtils/utils';

describe('Mapillary utils tests', () => {

    it('test debugTiles', () => {
        let imageSize = { w: 256, h: 256 };
        let request = { z: 10, imageId: 'imageID_123456' };
        let debugTilesObject = debugTiles(imageSize, request);
        expect(debugTilesObject.node_id).toEqual('imageID_123456');
        expect(typeof debugTilesObject.node).toEqual('object');
        expect(debugTilesObject.node.length).toBeGreaterThan(0);
    });
    it('test for getCellGridCollection', () => {
        let FEATURES_SAMPLE = [
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
        ];
        let cellGridCollection = getCellGridCollection({features: FEATURES_SAMPLE});
        expect(cellGridCollection.type).toEqual('FeatureCollection');
        expect(cellGridCollection.features.length).toEqual(1);
        expect(cellGridCollection.features[0].geometry.type).toEqual('Polygon');
    });
});
