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
    it('Test GeometryDetails endDrawing with 900913', (done) => {

        let geometry = {
            center: {
                srs: "EPSG:900913",
                x: -1761074.34,
                y: 5852757.63
            },
            projection: "EPSG:900913",
            radius: 836584,
            type: "Polygon"
        };

        // Moved logic of drawing to drawsupport
        const actions = {
            onChangeDrawingStatus: (drawStatus, notDef, owner, geom) => {
                expect(drawStatus).toBe('endDrawing');
                expect(geom).toEqual([{
                    type: 'Polygon',
                    center: { x: -1761074.34, y: 5852757.63 },
                    coordinates: [ -1761074.34, 5852757.63],
                    radius: 836584,
                    projection: 'EPSG:900913'
                }]);
                done();
            }
        };

        let type = "Circle";

        const cmp = ReactDOM.render(<GeometryDetails geometry={geometry} type={type} onChangeDrawingStatus={actions.onChangeDrawingStatus} />, document.getElementById("container"));
        expect(cmp).toExist();
        ReactTestUtils.Simulate.click(document.getElementsByClassName('glyphicon-ok')[0]); // <-- trigger event callback
    });

    it('Test GeometryDetails endDrawing with 4326', (done) => {

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

        // Moved logic of drawing to drawsupport
        const actions = {
            onChangeDrawingStatus: (drawStatus, notDef, owner, geom) => {
                expect(drawStatus).toBe('endDrawing');
                expect(geom).toEqual([{
                    type: 'Polygon',
                    center: { x: 0, y: 0 },
                    coordinates: [ 0, 0 ],
                    radius: 1,
                    projection: 'EPSG:4326'
                }]);
                done();
            }
        };

        const type = "Circle";

        const cmp = ReactDOM.render(<GeometryDetails geometry={geometry} type={type} onChangeDrawingStatus={actions.onChangeDrawingStatus} />, document.getElementById("container"));
        expect(cmp).toExist();
        ReactTestUtils.Simulate.click(document.getElementsByClassName('glyphicon-ok')[0]); // <-- trigger event callback
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
