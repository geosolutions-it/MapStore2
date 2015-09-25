/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var BackgroundSwitcher = require('../BackgroundSwitcher');
var {Thumbnail} = require('react-bootstrap');

describe("test the BakckgroundSwitcher", () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        let layers = [{
            "type": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "group": "background",
            "visibility": true
        }, {
            "type": "wms",
            "url": "http://213.215.135.196/reflector/open/service",
            "visibility": false,
            "title": "e-Geos Ortofoto RealVista 1.0",
            "name": "rv1",
            "group": "background",
            "format": "image/png"
        }];
        const tb = React.render(<BackgroundSwitcher layers={layers}/>, document.body);
        expect(tb).toExist();

    });

    it('create component without layers', () => {

        const tb = React.render(<BackgroundSwitcher />, document.body);
        expect(tb).toExist();

    });

    it('test select handler', () => {
        var TestUtils = React.addons.TestUtils;
        const testHandlers = {
            propertiesChangeHandler: (pressed) => {return pressed; }
        };
        let layers = [{
            "type": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "group": "background",
            "visibility": true
        }, {
            "type": "wms",
            "url": "http://213.215.135.196/reflector/open/service",
            "visibility": false,
            "title": "e-Geos Ortofoto RealVista 1.0",
            "name": "rv1",
            "group": "background",
            "format": "image/png"
        }];
        const spy = expect.spyOn(testHandlers, 'propertiesChangeHandler');
        var tb = React.render(<BackgroundSwitcher layers={layers} propertiesChangeHandler={testHandlers.propertiesChangeHandler}/>, document.body);
        let thumbs = TestUtils.scryRenderedComponentsWithType(tb, Thumbnail);
        expect(thumbs.length).toBe(2);
        React.findDOMNode(thumbs[0]).click();
        expect(spy.calls.length).toEqual(1);
    });
});
