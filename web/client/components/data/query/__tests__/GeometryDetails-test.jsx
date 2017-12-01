/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');


const GeometryDetails = require('../GeometryDetails.jsx');

const expect = require('expect');

describe('GeometryDetails', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the GeometryDetails component with Circle selection', () => {
        let geometry = {
            center: {
                srs: "EPSG:900913",
                x: -1761074.344349588,
                y: 5852757.632510748
            },
            projection: "EPSG:900913",
            radius: 836584.05,
            type: "Polygon"
        };

        let type = "Circle";

        const geometryDetails = ReactDOM.render(
            <GeometryDetails
                geometry={geometry}
                type={type}/>,
            document.getElementById("container")
        );

        expect(geometryDetails).toExist();
        expect(geometryDetails.props.geometry).toExist();
        expect(geometryDetails.props.geometry).toBe(geometry);
        expect(geometryDetails.props.type).toExist(true);
        expect(geometryDetails.props.type).toBe("Circle");

        const geometryDetailsDOMNode = expect(ReactDOM.findDOMNode(geometryDetails));
        expect(geometryDetailsDOMNode).toExist();

        let childNodes = geometryDetailsDOMNode.actual.childNodes;
        expect(childNodes.length).toBe(2);
        expect(childNodes[1]).toExist();
        const pb = childNodes[1].querySelector('.panel-body');
        expect(pb).toExist();
        let panelBodyRows = pb.getElementsByClassName('row');
        expect(panelBodyRows).toExist();
        expect(panelBodyRows.length).toBe(3);

        expect(pb.childNodes.length).toBe(1);
    });
    it('Test GeometryDetails onEndDrawing', () => {
        const actions = {
            onEndDrawing: () => {}
        };
        let geometry = {
            center: {
                srs: "EPSG:900913",
                x: -1761074.344349588,
                y: 5852757.632510748
            },
            projection: "EPSG:900913",
            radius: 836584.05,
            type: "Polygon"
        };

        let type = "Circle";

        const spyonEndDrawing = expect.spyOn(actions, 'onEndDrawing');
        const cmp = ReactDOM.render(<GeometryDetails geometry={geometry} type={type} onEndDrawing={actions.onEndDrawing} />, document.getElementById("container"));
        expect(cmp).toExist();
        ReactTestUtils.Simulate.click(document.getElementsByClassName('glyphicon-ok')[0]); // <-- trigger event callback
        expect(spyonEndDrawing).toHaveBeenCalled();
        expect(spyonEndDrawing.calls[0].arguments.length).toBe(2);
        const geom = spyonEndDrawing.calls[0].arguments[0];
        expect(geom).toExist();

    });

    it('Test GeometryDetails onEndDrawing with 4326 (leaflet)', () => {
        const actions = {
            onEndDrawing: () => {}
        };
        let geometry = {
            center: {
                srs: "EPSG:4326",
                x: 0,
                y: 0
            },
            projection: "EPSG:4326",
            radius: 1,
            type: "Polygon"
        };

        let type = "Circle";

        const spyonEndDrawing = expect.spyOn(actions, 'onEndDrawing');
        const cmp = ReactDOM.render(<GeometryDetails geometry={geometry} type={type} onEndDrawing={actions.onEndDrawing} />, document.getElementById("container"));
        expect(cmp).toExist();
        ReactTestUtils.Simulate.click(document.getElementsByClassName('glyphicon-ok')[0]); // <-- trigger event callback
        expect(spyonEndDrawing).toHaveBeenCalled();
        const geom = spyonEndDrawing.calls[0].arguments[0];
        const coords = geom.coordinates[0];
        // verify that the geometry is not bigger than radious
        for (let i = 0; i < coords.length; i++) {
            expect(Math.abs(coords[i][0]) <= 1).toBe(true);
            expect(Math.abs(coords[i][1]) <= 1).toBe(true);
        }

    });

    it('creates the GeometryDetails component with BBOX selection', () => {
        let geometry = {
            extent: [
                -1335833.8895192828,
                5212046.6457833825,
                -543239.115071175,
                5785158.045300978
            ],
            projection: "EPSG:900913",
            type: "Polygon"
        };

        let type = "BBOX";

        const geometryDetails = ReactDOM.render(
            <GeometryDetails
                geometry={geometry}
                type={type}/>,
            document.getElementById("container")
        );

        expect(geometryDetails).toExist();
        expect(geometryDetails.props.geometry).toExist();
        expect(geometryDetails.props.geometry).toBe(geometry);
        expect(geometryDetails.props.type).toExist(true);
        expect(geometryDetails.props.type).toBe("BBOX");

        const geometryDetailsDOMNode = expect(ReactDOM.findDOMNode(geometryDetails));
        expect(geometryDetailsDOMNode).toExist();

        let childNodes = geometryDetailsDOMNode.actual.childNodes;
        expect(childNodes.length).toBe(2);
        const pb = childNodes[1].querySelector('.panel-body');
        expect(pb).toExist();
        let panelBodyRows = pb.getElementsByClassName('row');
        expect(panelBodyRows).toExist();
        expect(panelBodyRows.length).toBe(3);
    });
});
