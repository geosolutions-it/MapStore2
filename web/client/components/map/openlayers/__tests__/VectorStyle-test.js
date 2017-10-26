/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const VectorStyle = require('../VectorStyle');
const ol = require('openlayers');

describe('Test VectorStyle', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('simple point style', () => {
        const style = VectorStyle.getStyle({
            style: {
                type: 'Point'
            }
        });
        expect(style).toExist();
        expect(style.getImage()).toExist();
    });

    it('image point style', () => {
        const style = VectorStyle.getStyle({
            style: {
                type: 'Point',
                iconUrl: 'myurl'
            }
        });
        expect(style).toExist();
        const feature = new ol.Feature({
              geometry: new ol.geom.Point(13.0, 43.0),
              name: 'My Point'
        });
        expect(style.call(feature)[0]. getImage()).toExist();
    });

    it('style name', () => {
        const style = VectorStyle.getStyle({
            type: 'Point',
            iconUrl: 'myurl'
        });
        expect(style).toExist();
    });

    it('guess image point style', () => {
        const feature = {
              geometry: {
                  type: 'Point',
                  coordinates: [13.0, 43.0]
              },
              name: 'My Point'
        };
        const style = VectorStyle.getStyle({
            features: [feature],
            style: {
                radius: 10,
                color: 'blue'
            }
        });
        expect(style).toExist();
        expect(style.getImage()).toExist();
    });
});
