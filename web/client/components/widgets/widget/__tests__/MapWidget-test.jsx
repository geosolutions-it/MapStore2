/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {compose, defaultProps} from 'recompose';
import '../../../../libs/bindings/rxjsRecompose';

import mapWidget from '../../enhancers/mapWidget';
import MapWidgetComp from '../MapWidget';

const MapWidget = compose(
    defaultProps({
        canEdit: true
    }),
    mapWidget)(MapWidgetComp);
describe('MapWidget component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapWidget rendering with defaults', () => {
        ReactDOM.render(<Provider store={{subscribe: () => {}, getState: () => ({maptype: {mapType: 'openlayers'}})}} ><MapWidget map={{size: {height: 401, width: 401}, layers: []}}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toExist();
        expect(container.querySelector('.glyphicon-trash')).toExist();
    });
    it('view only mode', () => {
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={{size: {height: 401, width: 401}, layers: [] }} canEdit={false}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toNotExist();
        expect(container.querySelector('.glyphicon-trash')).toNotExist();
    });
});
