/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import JSZip from 'jszip';

import {
    readJson,
    readZip,
    readShapePrjFiles,
    checkShapePrj,
    isFileSizeExceedMaxLimit,
    isWGS84LatLonPrj,
    shpToGeoJSON
} from '../FileUtils';
import axios from '../../libs/ajax';

const wgs84LonLatPrj = 'GEOGCS["WGS 84", DATUM["World Geodetic System 1984", SPHEROID["WGS 84", 6378137.0, 298.257223563, AUTHORITY["EPSG","7030"]], AUTHORITY["EPSG","6326"]], PRIMEM["Greenwich", 0.0, AUTHORITY["EPSG","8901"]], UNIT["degree", 0.017453292519943295], AXIS["Geodetic longitude", EAST], AXIS["Geodetic latitude", NORTH], AUTHORITY["EPSG","4326"]]';
const wgs84LatLonPrj = 'GEOGCS["WGS 84", DATUM["World Geodetic System 1984", SPHEROID["WGS 84", 6378137.0, 298.257223563, AUTHORITY["EPSG","7030"]], AUTHORITY["EPSG","6326"]], PRIMEM["Greenwich", 0.0, AUTHORITY["EPSG","8901"]], UNIT["degree", 0.017453292519943295], AXIS["Geodetic latitude", NORTH], AXIS["Geodetic longitude", EAST], AUTHORITY["EPSG","4326"]]';

const createPointShp = ([x, y]) => {
    const buffer = new ArrayBuffer(128);
    const view = new DataView(buffer);
    view.setInt32(0, 9994, false);
    view.setInt32(24, 64, false);
    view.setInt32(28, 1000, true);
    view.setInt32(32, 1, true);
    [x, y, x, y].forEach((value, idx) => view.setFloat64(36 + idx * 8, value, true));
    view.setInt32(100, 1, false);
    view.setInt32(104, 10, false);
    view.setInt32(108, 1, true);
    view.setFloat64(112, x, true);
    view.setFloat64(120, y, true);
    return buffer;
};

const createSingleRecordDbf = () => {
    const buffer = new ArrayBuffer(71);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    bytes[0] = 0x03;
    bytes[1] = 126;
    bytes[2] = 6;
    bytes[3] = 1;
    view.setUint32(4, 1, true);
    view.setUint16(8, 65, true);
    view.setUint16(10, 5, true);
    bytes.set([105, 100, 0], 32);
    bytes[43] = 78;
    bytes[48] = 4;
    bytes[64] = 0x0D;
    bytes[65] = 0x20;
    bytes.set([32, 32, 32, 49], 66);
    bytes[70] = 0x1A;
    return buffer;
};

const createPointShapeZip = ({name = 'point', coordinates, prj}) => {
    const zip = new JSZip();
    zip.file(`${name}.shp`, createPointShp(coordinates));
    zip.file(`${name}.dbf`, createSingleRecordDbf());
    zip.file(`${name}.prj`, prj);
    return zip.generateAsync({type: 'arraybuffer'});
};

describe('FilterUtils', () => {
    it('Test read local json file', (done) => {
        const jsonFile = new File(["[]"], "file.json", {
            type: "application/json"
        });
        readJson(jsonFile).then((res) => {
            expect(res instanceof Array).toBe(true);
            done();
        });
    });

    it('checkShapePrj', (done) => {
        axios.get("base/web/client/test-resources/TestShape.zip", { responseType: "blob" }).then(({data}) => {
            readZip(data).then((buffer) => {
                checkShapePrj(buffer).then((warnings) => {
                    expect(warnings.length).toBe(1);
                    done();
                });
            });
        });
    });
    it('shpToGeoJSON should normalize WGS84 latitude longitude prj axis order', (done) => {
        createPointShapeZip({
            name: 'native',
            coordinates: [37.51099000000001, -88.071564],
            prj: wgs84LatLonPrj
        }).then((buffer) => readShapePrjFiles(buffer).then((prjFiles) => {
            expect(isWGS84LatLonPrj(prjFiles.native)).toBe(true);
            const geoJSON = shpToGeoJSON(buffer, prjFiles)[0];
            expect(geoJSON.features[0].geometry.coordinates).toEqual([-88.071564, 37.51099000000001]);
            done();
        })).catch(done);
    });
    it('shpToGeoJSON should preserve WGS84 longitude latitude prj axis order', (done) => {
        createPointShapeZip({
            name: 'wgs84',
            coordinates: [-88.071564, 37.51099000000001],
            prj: wgs84LonLatPrj
        }).then((buffer) => readShapePrjFiles(buffer).then((prjFiles) => {
            expect(isWGS84LatLonPrj(prjFiles.wgs84)).toBe(false);
            const geoJSON = shpToGeoJSON(buffer, prjFiles)[0];
            expect(geoJSON.features[0].geometry.coordinates).toEqual([-88.071564, 37.51099000000001]);
            done();
        })).catch(done);
    });
    it('isFileSizeExceedMaxLimit with large size exceed the max', () => {
        const maxLimitInMega = 1;
        const fileWithSizeExceedMaxLimit = 2 * 1024 * 1024;
        let isFileSizeValid = isFileSizeExceedMaxLimit({size: fileWithSizeExceedMaxLimit}, maxLimitInMega);
        expect(isFileSizeValid).toEqual(true);
    });
    it('isFileSizeExceedMaxLimit with small file size less than max', () => {
        const maxLimitInMega = 1;
        const fileWithSizeNotExceedMaxLimit = 0.5 * 1024 * 1024;
        let isFileSizeValid = isFileSizeExceedMaxLimit({size: fileWithSizeNotExceedMaxLimit}, maxLimitInMega);
        expect(isFileSizeValid).toEqual(false);
    });
});
