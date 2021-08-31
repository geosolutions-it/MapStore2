/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import Map from 'ol/Map';
import View from 'ol/View';

import OlLocate from '../OlLocate';

const defaultOpt = {
    follow: true,
    remainActive: true,
    stopFollowingOnDrag: true,
    locateOptions: {
        maximumAge: 2000,
        enableHighAccuracy: false,
        timeout: 10000,
        maxZoom: 18,
        watch: false
    }
};
describe('Test the OlLocate utils', () => {
    let map;
    beforeEach((done)=>{
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        map = new Map({target: 'map', view: new View({center: [0, 0], zoom: 1})});
        setTimeout(done);
    });
    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test olLocate default options', () => {
        let olLocate = new OlLocate(map, defaultOpt);
        expect(olLocate).toBeTruthy();
        expect(olLocate.geolocate).toBeTruthy();
        expect(olLocate.map).toBeTruthy();
        expect(olLocate.layer).toBeTruthy();
        expect(olLocate.posFt).toBeTruthy();

        // Default options
        expect(olLocate.options.remainActive).toBeTruthy();
        expect(olLocate.options.follow).toBeTruthy();
        expect(olLocate.options.style).toBeTruthy();
        expect(olLocate.options.strings).toBeTruthy();
        expect(olLocate.options.locateOptions).toBeTruthy();
        expect(olLocate.options.locateOptions).toEqual(defaultOpt.locateOptions);
    });

    it('test olLocate setTrackingOptions', () => {
        let olLocate = new OlLocate(map, defaultOpt);
        expect(olLocate).toBeTruthy();
        const updateOptions = {...defaultOpt, locateOptions: {...defaultOpt.locateOptions, enableHighAccuracy: true, watch: true}};
        olLocate.setTrackingOptions(updateOptions);
        expect(olLocate.options.locateOptions).toEqual(updateOptions);
    });
    it('test olLocate on follow', () => {
        let olLocate = new OlLocate(map, defaultOpt);
        expect(olLocate).toBeTruthy();
        olLocate.startFollow();
        olLocate.geolocate.setProperties({position: [10, 20], accuracy: 10});
        expect(olLocate.map.getView().getCenter()).toEqual([10, 20]);
    });
    it('test olLocate on position change', () => {
        let olLocate = new OlLocate(map, defaultOpt);
        expect(olLocate).toBeTruthy();
        olLocate.startFollow();
        olLocate.geolocate.setProperties({position: [10, 20], accuracy: 10});
        olLocate.geolocate.dispatchEvent('change:position');
        expect(olLocate.p).toBeTruthy();
        expect(olLocate.p).toEqual([10, 20]);
        expect(olLocate.posFt).toBeTruthy();
        expect(olLocate.posFt.getGeometry()).toBeTruthy();
        expect(olLocate.posFt.getStyle()(olLocate.posFt).getImage().getRadius()).toBe(6);
        expect(olLocate.map.getView().getCenter()).toEqual([10, 20]);
        expect(olLocate.geolocate.getTracking()).toBeFalsy();
    });
    it('test olLocate on heading change', (done) => {
        let olLocate = new OlLocate(map, defaultOpt);
        expect(olLocate).toBeTruthy();
        olLocate.geolocate.setProperties({position: [10, 20], accuracy: 10, heading: 90});
        olLocate.geolocate.dispatchEvent('change:position');
        expect(olLocate.geolocate.getHeading()).toBe(90);
        expect(olLocate.p).toBeTruthy();
        expect(olLocate.p).toEqual([10, 20]);
        expect(olLocate.posFt).toBeTruthy();
        expect(olLocate.posFt.getGeometry()).toBeTruthy();
        expect(olLocate.posFt.getStyle()(olLocate.posFt).getImage().getRotation()).toBe(90);
        done();

    });
});
