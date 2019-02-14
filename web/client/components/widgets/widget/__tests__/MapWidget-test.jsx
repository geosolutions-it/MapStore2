/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {Provider} = require('react-redux');
const {compose, defaultProps} = require('recompose');
const expect = require('expect');
const mapWidget = require('../../enhancers/mapWidget');

const MapWidget = compose(
    defaultProps({
        canEdit: true
    }),
    mapWidget)(require('../MapWidget'));
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
        ReactDOM.render(<Provider store={{subscribe: () => {}, getState: () => ({maptype: {mapType: 'openlayers'}})}} ><MapWidget map={{layers: []}}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toExist();
        expect(container.querySelector('.glyphicon-trash')).toExist();
    });
    it('view only mode', () => {
        ReactDOM.render(<Provider store={{ subscribe: () => { }, getState: () => ({ maptype: { mapType: 'openlayers' } }) }} ><MapWidget map={{ layers: [] }} canEdit={false}/></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toNotExist();
        expect(container.querySelector('.glyphicon-trash')).toNotExist();
    });
});
