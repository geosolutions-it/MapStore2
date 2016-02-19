/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const SpatialFilter = require('../SpatialFilter.jsx');

const expect = require('expect');

describe('SpatialFilter', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the SpatialFilter component with options', () => {
        const spatialfilter = ReactDOM.render(
            <SpatialFilter/>,
            document.getElementById("container")
        );

        expect(spatialfilter).toExist();

        const spatialFilterDOMNode = expect(ReactDOM.findDOMNode(spatialfilter));
        expect(spatialFilterDOMNode).toExist();
    });
});
