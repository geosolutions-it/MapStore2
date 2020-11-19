/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import SnapshotPanel from '../SnapshotPanel';

describe("test the SnapshotPanel", () => {
    beforeEach((done) => {
        // emulate empty map
        document.body.innerHTML = '<div><div id="container"></div>' +
            '<div id="map" style="width:100%; height:100%"><canvas></canvas>' +
                '<div class="leaflet-tile-pane"><div class="leaflet-layer"></div></div>' +
            '</div></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('component creation', () => {
        const tb = ReactDOM.render(<SnapshotPanel timeout={0} snapshot={{state: "DISABLED"}} active={false}/>, document.getElementById("container"));
        expect(tb).toExist();

    });

    it('component update', () => {
        let tb = ReactDOM.render(<SnapshotPanel timeout={0} snapshot={{state: "DISABLED"}} active={false}/>, document.getElementById("container"));
        expect(tb).toExist();
        tb = ReactDOM.render(<SnapshotPanel timeout={0} snapshot={{state: "DISABLED"}} active={false} layers={[]}/>, document.getElementById("container"));
    });


    it('component disabled', () => {
        let layers = [{loading: false, type: "google", visibility: true}, {loading: true}];
        let map = {size: {width: 20, height: 20}, zoom: 10};
        const tb = ReactDOM.render(<SnapshotPanel map={map} layers={layers} timeout={0} snapshot={{state: "DISABLED"}} active/>, document.getElementById("container"));
        expect(tb).toExist();
        expect(document.getElementsByTagName('h4').length).toBe(1);
    });

    it('component error', () => {
        let layers = [{loading: false, type: "google", visibility: true}, {loading: true}];
        let map = {size: {width: 20, height: 20}, zoom: 10};
        const tb = ReactDOM.render(<SnapshotPanel map={map} snapshot={{error: "ERROR"}} layers={layers} timeout={0} active/>, document.getElementById("container"));
        expect(tb).toExist();
        expect(document.getElementsByTagName('h4').length).toBe(1);
    });

    it('component tainted', () => {
        const tb = ReactDOM.render(<SnapshotPanel snapshot={{tainted: true}} timeout={0} active={false}/>, document.getElementById("container"));
        expect(tb).toExist();
    });

    it('loading queue display', () => {
        let layers = [{loading: false, type: "google", visibility: true}, {loading: true}];
        let map = {size: {width: 20, height: 20}, zoom: 10};
        const tb = ReactDOM.render(<SnapshotPanel map={map} layers={layers} wrap timeout={0} snapshot={{state: "DISABLED", queue: [{key: 1}]}} active/>, document.getElementById("container"));
        expect(tb).toExist();
        ReactTestUtils.scryRenderedDOMComponentsWithClass(tb, "label-danger");
    });
});
