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
                x: -1764074.344349588,
                y: 5854757.632510748
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

        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        // checking number of decimals
        expect(inputs[0].value.substring(inputs[0].value.indexOf(".") + 1).length).toBe(6); // "-15.846949"
        expect(inputs[1].value.substring(inputs[1].value.indexOf(".") + 1).length).toBe(6); // "46.462377"
        expect(inputs[2].value.substring(inputs[2].value.indexOf(".") + 1).length).toBe(2); // "6114748.17"

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
                expect(geom[0]).toExist();
                expect(geom[0].type).toBe('Polygon');
                expect(geom[0].center).toExist();
                expect(geom[0].center.x).toExist();
                expect(geom[0].center.x.toPrecision(9)).toBe('-1761074.34');
                expect(geom[0].center.y).toExist();
                expect(geom[0].center.y.toPrecision(9)).toBe('5852757.63');
                expect(geom[0].radius).toBe(836584);
                expect(geom[0].projection).toBe('EPSG:900913');
                done();
            }
        };

        let type = "Circle";

        const cmp = ReactDOM.render(<GeometryDetails geometry={geometry} projection="EPSG:900913" type={type} onChangeDrawingStatus={actions.onChangeDrawingStatus} />, document.getElementById("container"));
        expect(cmp).toExist();
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
        expect(cmp).toExist();
        ReactTestUtils.Simulate.click(document.getElementsByClassName('glyphicon-ok')[0]); // <-- trigger event callback
    });

    it('creates the GeometryDetails component with BBOX selection', () => {
        let geometry = {
            extent: [
                -12080719.446415536,
                3035467.26726092,
                -11112109.423985783,
                6146760.066580733
            ],
            projection: "EPSG:900913",
            type: "Polygon"
        };

        const actions = {
            onChangeDrawingStatus: () =>{}
        };
        let type = "BBOX";
        const spyOnChangeDrawingStatus = expect.spyOn(actions, "onChangeDrawingStatus");
        const geometryDetails = ReactDOM.render(
            <GeometryDetails
                geometry={geometry}
                projection="EPSG:900913"
                type={type}
                onChangeDrawingStatus={actions.onChangeDrawingStatus}/>,
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

        const panelBodyInputs = pb.querySelectorAll('input');
        expect(panelBodyInputs.length).toBe(4);

        [...panelBodyInputs].forEach(input => {
            const [mainValue, decimals] = input.value.split('.');

            expect(mainValue.length + decimals.length <= 10 && mainValue.length + decimals.length >= 7).toBeTruthy();
            expect(mainValue.length <= 4).toBeTruthy(); // can be ranged from 180 to -180
            expect(decimals.length === 6).toBeTruthy(); // always must be 6 digits
            input.value = 10;
            ReactTestUtils.Simulate.change(input);
            expect(spyOnChangeDrawingStatus).toHaveBeenCalled();
            expect(spyOnChangeDrawingStatus.calls[0].arguments[0]).toBe('replace');
            const geometryOutput = spyOnChangeDrawingStatus.calls[0].arguments[3];
            expect(geometryOutput[0].type).toBe('Polygon');
            expect(geometryOutput[0].coordinates).toBeTruthy();
            expect(geometryOutput[0].coordinates[0].length).toBe(5);

        });
    });
});
