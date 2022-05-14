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
        expect(olLocate.posFt.getStyle()(olLocate.posFt).getImage().getSize()).toEqual([300, 300]);
        expect(olLocate.posFt.getStyle()(olLocate.posFt).getImage().getSrc()).toBeTruthy();
        expect(olLocate.posFt.getStyle()(olLocate.posFt).getImage().getSrc()).toBe('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20100%20100%22%20xml%3Aspace%3D%22preserve%22%3E%0A%09%09%3Cg%20transform%3D%22matrix(0.2%200%200%200.2%2049.8%2050.19)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3ClinearGradient%20gradientUnits%3D%22userSpaceOnUse%22%20gradientTransform%3D%22matrix(1%200%200%201%20-65%20-65)%22%20x1%3D%2265%22%20y1%3D%22130%22%20x2%3D%2265%22%20y2%3D%220%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3Argba(0%2C%20132%2C%20202%2C%201)%3B%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3Argba(0%2C%200%2C%20255%2C%201)%3B%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20style%3D%22stroke%3A%20rgb(255%2C255%2C255)%3B%20stroke-width%3A%208%3B%20stroke-dasharray%3A%20none%3B%20stroke-linecap%3A%20butt%3B%20stroke-dashoffset%3A%200%3B%20stroke-linejoin%3A%20miter%3B%20stroke-miterlimit%3A%204%3B%20fill%3A%20%232A93EE%3B%20fill-rule%3A%20nonzero%3B%20opacity%3A%201%3B%22%20vector-effect%3D%22non-scaling-stroke%22%20cx%3D%220%22%20cy%3D%220%22%20r%3D%2265%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%3C%2Fsvg%3E');
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
