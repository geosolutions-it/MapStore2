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
                projection="EPSG:900913"
                type={type}/>,
            document.getElementById("container")
        );

        expect(geometryDetails).toBeTruthy();
        expect(geometryDetails.props.geometry).toBeTruthy();
        expect(geometryDetails.props.geometry).toBe(geometry);
        expect(geometryDetails.props.type).toBeTruthy();
        expect(geometryDetails.props.type).toBe("Circle");

        const geometryDetailsDOMNode = ReactDOM.findDOMNode(geometryDetails);
        expect(geometryDetailsDOMNode).toBeTruthy();

        let childNodes = geometryDetailsDOMNode.childNodes;
        expect(childNodes.length).toBe(2);
        expect(childNodes[1]).toBeTruthy();
        const pb = childNodes[1].querySelector('.panel-body');
        expect(pb).toBeTruthy();
        let panelBodyRows = pb.getElementsByClassName('row');
        expect(panelBodyRows).toBeTruthy();
        expect(panelBodyRows.length).toBe(3);

        expect(pb.childNodes.length).toBe(1);
    });

    it('Test GeometryDetails endDrawing with 900913 and 900913', (done) => {

        let geometry = {
            center: [-1761074.34, 5852757.63],
            projection: "EPSG:900913",
            radius: 836584,
            type: "Polygon"
        };

        // Moved logic of drawing to drawsupport
        const actions = {
            onChangeDrawingStatus: (drawStatus, notDef, owner, geom) => {
                expect(drawStatus).toBe('endDrawing');
                expect(geom[0]).toBeTruthy();
                expect(geom[0].type).toBe('Polygon');
                expect(geom[0].center).toBeTruthy();
                expect(geom[0].center.x).toBeTruthy();
                expect(geom[0].center.x.toPrecision(9)).toBe('-1761074.34');
                expect(geom[0].center.y).toBeTruthy();
                expect(geom[0].center.y.toPrecision(9)).toBe('5852757.63');
                expect(geom[0].radius).toBe(836584);
                expect(geom[0].projection).toBe('EPSG:900913');
                done();
            }
        };

        let type = "Circle";

        const cmp = ReactDOM.render(<GeometryDetails geometry={geometry} projection="EPSG:900913" type={type} onChangeDrawingStatus={actions.onChangeDrawingStatus} />, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        ReactTestUtils.Simulate.click(document.getElementsByClassName('glyphicon-ok')[0]); // <-- trigger event callback
    });

    it('Test GeometryDetails endDrawing with 4326 and 4326', (done) => {

        let geometry = {
            center: [0, 0],
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

        const cmp = ReactDOM.render(<GeometryDetails geometry={geometry} projection="EPSG:4326" type={type} onChangeDrawingStatus={actions.onChangeDrawingStatus} />, document.getElementById("container"));
        expect(cmp).toBeTruthy();
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
                projection="EPSG:900913"
                type={type}/>,
            document.getElementById("container")
        );

        expect(geometryDetails).toBeTruthy();
        expect(geometryDetails.props.geometry).toBeTruthy();
        expect(geometryDetails.props.geometry).toBe(geometry);
        expect(geometryDetails.props.type).toBeTruthy();
        expect(geometryDetails.props.type).toBe("BBOX");

        const geometryDetailsDOMNode = ReactDOM.findDOMNode(geometryDetails);
        expect(geometryDetailsDOMNode).toBeTruthy();

        let childNodes = geometryDetailsDOMNode.childNodes;
        expect(childNodes.length).toBe(2);
        const pb = childNodes[1].querySelector('.panel-body');
        expect(pb).toBeTruthy();
        let panelBodyRows = pb.getElementsByClassName('row');
        expect(panelBodyRows).toBeTruthy();
        expect(panelBodyRows.length).toBe(3);
    });
});
