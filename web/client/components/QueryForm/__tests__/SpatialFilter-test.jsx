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

    it('creates the SpatialFilter component', () => {
        let spatialField = {
            method: null,
            attribute: "the_geom",
            operation: "INTERSECTS",
            geometry: null
        };

        const spatialfilter = ReactDOM.render(
            <SpatialFilter
                spatialField={spatialField}
                spatialPanelExpanded={true}
                showDetailsPanel={false}/>,
            document.getElementById("container")
        );

        expect(spatialfilter).toExist();
        expect(spatialfilter.props.spatialField).toExist();
        expect(spatialfilter.props.spatialField).toBe(spatialField);
        expect(spatialfilter.props.spatialPanelExpanded).toBe(true);
        expect(spatialfilter.props.showDetailsPanel).toBe(false);

        const spatialFilterDOMNode = expect(ReactDOM.findDOMNode(spatialfilter));
        expect(spatialFilterDOMNode).toExist();

        let spatialPanel = spatialFilterDOMNode.actual.childNodes[0].childNodes[1].id;
        expect(spatialPanel).toExist();
        expect(spatialPanel).toBe("spatialFilterPanel");

        let combosPanel = spatialFilterDOMNode.actual.getElementsByClassName('panel-body');
        expect(combosPanel).toExist();

        let logicHeader = combosPanel[1].childNodes[0];
        expect(logicHeader).toExist();
        expect(logicHeader.className).toBe("logicHeader row");

        let operationPanelRows = combosPanel[2].getElementsByClassName('row');
        expect(operationPanelRows.length).toBe(2);
    });
});
