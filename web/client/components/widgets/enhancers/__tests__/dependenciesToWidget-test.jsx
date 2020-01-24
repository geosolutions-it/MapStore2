/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const dependenciesToWidget = require('../dependenciesToWidget');


describe('dependenciesToWidget enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependency transformation', (done) => {
        const Sink = dependenciesToWidget(createSink( props => {
            expect(props).toExist();
            expect(props.dependencies.x).toBe("a");
            done();
        }));
        ReactDOM.render(<Sink dependenciesMap={{x: "b"}} dependencies={{b: "a"}}/>, document.getElementById("container"));
    });
    it('dependency transformation, avoid loop', (done) => {

        const dependencies = {
            "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap": {
                mapSync: "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].mapSync",
                zoom: "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].map.zoom",
                dependenciesMap: "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap"
            },
            "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].mapSync": true,
            "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].map.zoom": 4,
            "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap": {
                zoom: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.zoom",
                mapSync: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].mapSync",
                dependenciesMap: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap"
            },
            "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].mapSync": true,
            "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].map.zoom": 4,
            "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap": {
                zoom: "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].map.zoom",
                mapSync: "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].mapSync",
                dependenciesMap: "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap"
            },
            "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].mapSync": true,
            "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.center": {x: -107.92361235618598, y: 37.28025446000009, crs: "EPSG:4326"},
            "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.zoom": 4
        };
        const dependenciesMap = {
            center: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.center",
            zoom: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.zoom",
            filter: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].filter",
            quickFilters: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].quickFilters",
            layer: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].layer",
            options: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].options",
            mapSync: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].mapSync",
            dependenciesMap: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap"
        };
        const Sink = dependenciesToWidget(createSink( props => {
            expect(props).toExist();
            expect(props.dependencies.zoom).toBe(4);
            // if there was a loop an maximum call stack exceeded error would be thrown
            done();
        }));
        ReactDOM.render(<Sink
            id="c6656090-3de1-11ea-8ee8-c127e39ddf83"
            dependenciesMap={dependenciesMap}
            dependencies={dependencies}
        />, document.getElementById("container"));
    });

});
