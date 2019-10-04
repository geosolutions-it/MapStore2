/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ReactDOM = require('react-dom');
var ReactTestUtils = require('react-dom/test-utils');
var ElevationChart = require('../ElevationChart');

var expect = require('expect');

describe('test Layer Properties Elevation Chart component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests component rendering', () => {
        const l = {
            name: 'testworkspace:testlayer',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'shapefile',
            url: 'base/web/client/test-resources/geoserver/wms',
            params: {
                "ELEVATION": "1.5"
            },
            elevations: {
                name: "ELEVATION",
                units: "Meters",
                positive: true,
                values: ["1.5", "5.0", "10.0", "15.0", "20.0", "25.0", "30.0"]
            }
        };

        const comp = ReactDOM.render(
            <ElevationChart
                positive
                elevations={l.elevations}/>,
            document.getElementById("container")
        );

        expect(comp).toExist();
        const div = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "div" );
        expect(div).toExist();
    });

    it('Render 1 line in simple LineChart', () => {
        const l = {
            name: 'testworkspace:testlayer',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'shapefile',
            url: 'base/web/client/test-resources/geoserver/wms',
            params: {
                "ELEVATION": "1.5"
            },
            elevations: {
                name: "ELEVATION",
                units: "Meters",
                positive: true,
                values: ["1.5", "5.0", "10.0", "15.0", "20.0", "25.0", "30.0"]
            }
        };

        const comp = ReactDOM.render(
            <ElevationChart
                elevations={l.elevations}/>,
            document.getElementById("container")
        );

        expect(comp).toExist();

        const chart = ReactDOM.findDOMNode(comp).querySelector('.recharts-line .recharts-line-curve');
        expect(chart).toExist();
    });
});
