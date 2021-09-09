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
    stopFollowingOnDrag: true,
    remainActive: true,
    locateOptions: {
        speedThreshold: 0.8, // m/s
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
        expect(llocate.options.remainActive).toBeTruthy();
        expect(llocate.options.follow).toBeTruthy();
    });
    it('test LLocate setFollowMarkerStyle', () => {
        let llocate = new LLocate(defaultOpt);
        expect(llocate).toBeTruthy();
        const latlng = {x: 3, y: 4};
        const heading = 1;
        const speed = 2;
        llocate.setMap(map);
        llocate._activate();
        llocate.setFollowMarkerStyle(latlng, heading, speed);
        const {rotationAngle, rotationOrigin, icon: {options: markerStyle}} = llocate._marker.options;
        expect(markerStyle.className).toEqual("div-heading-icon");
        expect(markerStyle.fillOpacity).toEqual(1);
        expect(markerStyle.opacity).toEqual(1);
        expect(markerStyle.iconSize).toEqual(70);
        expect(markerStyle.html).toEqual(`<svg xmlns="http://www.w3.org/2000/svg" undefined viewBox="0 0 100 100" xml:space="preserve">
		<g transform="matrix(0.2 0 0 0.2 49.8 50.19)">
            <linearGradient gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 1 -65 -65)" x1="65" y1="130" x2="65" y2="0">
                <stop offset="100%" style="stop-color:rgba(0, 132, 202, 1);"/>
                <stop offset="100%" style="stop-color:rgba(0, 0, 255, 1);"/>
            </linearGradient>
            <circle style="stroke: rgb(255,255,255); stroke-width: 2; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: #2A93EE; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke" cx="0" cy="0" r="65"/>
        </g>
        <g transform="matrix(-0.12 -0.22 0.22 -0.12 47.11 20.53)">
            <polygon style="stroke: rgb(255,255,255); stroke-width: 2; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: #2A93EE; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke" points="0,-42.5 50,42.5 -50,42.5 "/>
        </g>
    </svg>`);
        expect(rotationAngle).toEqual(heading);
        expect(rotationOrigin).toEqual("center center");

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
