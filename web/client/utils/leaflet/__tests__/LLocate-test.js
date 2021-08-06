/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import LLocate from '../LLocate';
import L from 'leaflet';

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
describe('Test the leaflet LLocate utils', () => {
    let map;
    beforeEach((done)=>{
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        map = L.map('map');
        setTimeout(done);
    });
    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test LLocate default options', () => {
        let llocate = new LLocate(defaultOpt);
        expect(llocate).toBeTruthy();
        expect(llocate.options.followCircleStyle).toBeTruthy();
        expect(llocate.options.followMarkerStyle).toBeTruthy();
        expect(llocate.options.remainActive).toBeTruthy();
        expect(llocate.options.follow).toBeTruthy();
    });
    it('test LLocate setLocateOptions', () => {
        let llocate = new LLocate(defaultOpt);
        expect(llocate).toBeTruthy();
        const updateOptions = {...defaultOpt, locateOptions: {...defaultOpt.locateOptions, enableHighAccuracy: true, watch: true}};
        llocate.setLocateOptions(updateOptions);
        expect(llocate.options.locateOptions).toEqual(updateOptions);
    });
    it('test LLocate on setMap', () => {
        let llocate = new LLocate(defaultOpt);
        expect(llocate).toBeTruthy();
        llocate.setMap(map);
        expect(llocate._map).toBeTruthy();
        expect(llocate.options.followMarkerStyle).toBeTruthy();
        const {icon: {options: {className}}, rotationOrigin} = llocate.options.followMarkerStyle;
        expect(className).toBe('div-heading-icon');
        expect(rotationOrigin).toBe('center center');
    });
    it('test LLocate on location found', () => {
        let llocate = new LLocate(defaultOpt);
        const latlng = {lat: 71, lng: 13};
        expect(llocate).toBeTruthy();
        llocate.setMap(map);
        expect(llocate._map).toBeTruthy();
        llocate._activate();
        try {
            llocate._map.fireEvent('locationfound', {accuracy: 150, latlng});
            // eslint-disable-next-line no-empty
        } catch (e) { } // Ignore invalid map bounds
        const circleMarker = llocate._circle;
        const innerMarker = llocate._marker;
        expect(circleMarker.getLatLng().lat).toBe(latlng.lat);
        expect(circleMarker.getLatLng().lng).toBe(latlng.lng);
        expect(circleMarker.getRadius()).toBe(150);

        expect(innerMarker.getLatLng().lat).toBe(latlng.lat);
        expect(innerMarker.getLatLng().lng).toBe(latlng.lng);
        expect(innerMarker.options).toBeTruthy();
    });
    it('test LLocate on heading change', () => {
        let llocate = new LLocate(defaultOpt);
        const latlng = {lat: 71, lng: 13};
        expect(llocate).toBeTruthy();
        llocate.setMap(map);
        expect(llocate._map).toBeTruthy();
        llocate._activate();
        try {
            llocate._map.fireEvent('locationfound', {accuracy: 150, latlng, heading: 90});
            // eslint-disable-next-line no-empty
        } catch (e) { } // Ignore invalid map bounds
        const circleMarker = llocate._circle;
        const innerMarker = llocate._marker;
        expect(circleMarker.getLatLng().lat).toBe(latlng.lat);
        expect(circleMarker.getLatLng().lng).toBe(latlng.lng);
        expect(circleMarker.getRadius()).toBe(150);

        expect(llocate._event.heading).toBe(90);

        expect(innerMarker.getLatLng().lat).toBe(latlng.lat);
        expect(innerMarker.getLatLng().lng).toBe(latlng.lng);
        expect(innerMarker.options).toBeTruthy();
        const {icon} = innerMarker.options;
        expect(icon).toBeTruthy();
        // Marker is navigation icon
        expect(icon.options.className).toBe('div-heading-icon');
        expect(innerMarker.options.rotationAngle).toBe(90);
        expect(innerMarker.options.rotationOrigin).toBeTruthy();
    });
});
