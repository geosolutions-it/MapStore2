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

    let map = new Map({
        target: "map",
        view: new View(viewOptions)
    });

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
            target: "map",
            view: new View(viewOptions)
        });
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(psNode);
        document.body.innerHTML = '';
        psNode = undefined;
        map = new Map({
            target: "map",
            view: new View(viewOptions)
        });
        expect.restoreSpies();
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
        expect(getOverlaysNum(map)).toBe(1);
        expect(document.querySelector('#test-popup')).toExist();
    });
});

