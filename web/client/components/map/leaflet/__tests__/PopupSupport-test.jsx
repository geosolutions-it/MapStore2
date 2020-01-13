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

    it('should attach popup to map', () => {
        const popups = [
            {
                id: 'test-popup',
                content: () => <div>popup content text</div>,
                position: { coordinates: [0, 0] },
                autoPan: false
            }
        ];
        const component = renderPopups({ popups });
        expect(component).toExist();
        expect(document.querySelector('#test-popup')).toExist();
    });
});

