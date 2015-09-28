/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var Legend = require('../Legend');

describe("test the Layer legend", () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        let layer = {
            "type": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "group": "background",
            "visibility": true
        };
        const tb = React.render(<Legend layer={layer}/>, document.body);
        expect(tb).toExist();

    });

    it('create component without layer', () => {

        const tb = React.render(<Legend />, document.body);
        expect(tb).toExist();

    });

    it('test legend content', () => {
        var TestUtils = React.addons.TestUtils;
        let layer = {
            "type": "wms",
            "url": "http://test2/reflector/open/service",
            "visibility": true,
            "title": "test layer 3 (no group)",
            "name": "layer3",
            "format": "image/png"
        };
        var tb = React.render(<Legend layer={layer} />, document.body);
        let thumbs = TestUtils.scryRenderedDOMComponentsWithTag(tb, "img");
        expect(thumbs.length).toBe(1);
    });

});
