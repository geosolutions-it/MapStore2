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

import L from 'leaflet';
import PopupSupport from '../PopupSupport';

const popupExists = () => {
    const popup = document.querySelector('.leaflet-popup-content');
    expect(popup).toExist();
    return popup;
};

describe('Leaflet PopupSupport', () => {
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

    beforeEach((done) => {
        document.body.innerHTML = '<div id="map" style="heigth: 100px; width: 100px"></div><div id="ps"></div>';
        psNode = document.getElementById('ps');
        map = L.map("map", {
            center: [25, 25],
            zoom: 13
        });
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(psNode);
        document.body.innerHTML = '';
        psNode = undefined;
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
                position: { coordinates: {lat: 0, lng: 0} },
                autoPan: false
            }

        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        const popup = popupExists();
        expect(popup.querySelector('#test-map-popup')).toExist();
    });
    it('should attach popup with a html content to map', () => {
        const popups = [
            {
                id: 'test',
                content: '<div id="innerHtml">popup text content</div>',
                position: { coordinates: {lat: 0, lng: 0} },
                autoPan: false
            }

        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        const popup = popupExists();
        expect(popup.querySelector('#innerHtml')).toExist();
    });
    it('should attach popup with a component to map', () => {
        const popups = [
            {
                id: 'test',
                component: () => (<div style={{width: 300, height: 100}} >popup content text</div>),
                position: { coordinates: {lat: 0, lng: 0} },
                autoPan: false
            }

        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        const popup = popupExists();
        expect(popup.querySelector('#test-map-popup')).toExist();
    });
    it('should attach popup with a component instance to map', () => {
        const popups = [
            {
                id: 'test',
                component: <div style={{width: 300, height: 100}} >popup content text</div>,
                position: { coordinates: {lat: 0, lng: 0} },
                autoPan: false
            }
        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        const popup = popupExists();
        expect(popup.querySelector('#test-map-popup')).toExist();
    });
    it('should attach popups text, html, component', () => {
        const popups = [
            {
                id: 'test-text',
                content: "popup text content",
                position: { coordinates: {lat: 0, lng: 0} },
                autoPan: false
            },
            {
                id: 'test-html',
                content: '<div id="innerHtml">popup text content</div>',
                position: { coordinates: {lat: 0, lng: 0} },
                autoPan: false
            },
            {
                id: 'test-component',
                component: () => (<div style={{width: 300, height: 100}} >popup content text</div>),
                position: { coordinates: {lat: 0, lng: 0} },
                autoPan: false
            }

        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        const poups = document.querySelectorAll('.leaflet-popup-content');
        expect(poups).toExist();
        expect(poups.length).toBe(3);
        expect(poups[0].querySelector('#test-text-map-popup')).toExist();
        expect(poups[1].querySelector('#test-html-map-popup')).toExist();
        expect(poups[2].querySelector('#test-component-map-popup')).toExist();
    });
    it('should close an open popups and call the right action', (done) => {
        const popups = [
            {
                id: 'test-text',
                content: "popup text content",
                position: { coordinates: {lat: 0, lng: 0} },
                autoPan: false
            }
        ];
        const onPopupClose = (id) => {
            expect(id).toBe(popups[0].id);
            done();
        };
        const component = renderPopups({ popups, onPopupClose});
        expect(component).toExist();
        const close = document.querySelector('.leaflet-popup-close-button');
        close.click();
    });
});

