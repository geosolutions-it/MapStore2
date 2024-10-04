/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import { Map, View } from 'ol';
import PopupSupport from '../PopupSupport';

describe('Openlayers PopupSupport', () => {
    const viewOptions = {
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 5
    };
    let psNode;
    let map;

    const renderPopups = (props = {}) => {
        return ReactDOM.render(
            <PopupSupport
                map={props.map || map}
                {...props}
            />,
            psNode
        );
    };

    const getOverlaysNum = (olMap) => {
        return olMap.getOverlays().getLength();
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map" style="heigth: 100px; width: 100px"></div><div id="ps"></div>';
        psNode = document.getElementById('ps');
        map = new Map({
            layers: [],
            target: "map",
            view: new View(viewOptions)
        });
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(psNode);
        document.body.innerHTML = '';
        psNode = undefined;
        map.setTarget(null);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render', () => {
        const component = renderPopups();
        expect(component).toExist();
    });
    it('should attach popup with a text content to map', () => {
        const popups = [
            {
                id: 'test',
                content: "popup text content",
                position: { coordinates: [0, 0]},
                autoPan: false
            }

        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        expect(getOverlaysNum(map)).toBe(1);
        expect(document.querySelector('#test-map-popup')).toExist();
    });
    it('should attach popup with a html content to map', () => {
        const popups = [
            {
                id: 'test',
                content: '<div id="innerHtml">popup text content</div>',
                position: { coordinates: [0, 0] },
                autoPan: false
            }

        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        expect(getOverlaysNum(map)).toBe(1);
        expect(document.querySelector('#innerHtml')).toExist();
    });
    it('should attach popup with a component to map', () => {
        const popups = [
            {
                id: 'test',
                component: () => (<div style={{width: 300, height: 100}} >popup content text</div>),
                position: { coordinates: [0, 0]},
                autoPan: false
            }

        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        expect(getOverlaysNum(map)).toBe(1);
        expect(document.querySelector('#test-map-popup')).toExist();
    });
    it('should attach popup with a component instance to map', () => {
        const popups = [
            {
                id: 'test',
                component: <div style={{width: 300, height: 100}} >popup content text</div>,
                position: { coordinates: [0, 0]},
                autoPan: false
            }
        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        expect(getOverlaysNum(map)).toBe(1);
        expect(document.querySelector('#test-map-popup')).toExist();
    });
    it('should attach popups text, html, component', () => {
        const popups = [
            {
                id: 'test-text',
                content: "popup text content",
                position: { coordinates: [0, 0] },
                autoPan: false
            },
            {
                id: 'test-html',
                content: '<div id="innerHtml">popup text content</div>',
                position: { coordinates: [0, 0] },
                autoPan: false
            },
            {
                id: 'test-component',
                component: () => (<div style={{width: 300, height: 100}} >popup content text</div>),
                position: { coordinates: [0, 0] },
                autoPan: false
            }

        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        expect(getOverlaysNum(map)).toBe(3);

        expect(document.querySelector('#test-text-map-popup')).toExist();
        expect(document.querySelector('#test-html-map-popup')).toExist();
        expect(document.querySelector('#test-component-map-popup')).toExist();
    });

});

