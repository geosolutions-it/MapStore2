/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var MeasureComponent = require('../MeasureComponent');

describe("test the MeasureComponent", () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        let measurement = {};
        const mc = React.render(<MeasureComponent measurement={measurement}/>, document.body);
        expect(mc).toExist();
    });

    it('test creation of button UIs ', () => {
        let measurement = {};
        const mc = React.render(<MeasureComponent measurement={measurement}/>, document.body);
        expect(mc).toExist();
        const domNode = React.findDOMNode(mc);
        expect(domNode).toExist();
        const domButtons = domNode.getElementsByTagName('button');
        expect(domButtons).toExist();
        expect(domButtons.length).toBe(4);
    });

    it('test creation of measurement result panel UI ', () => {
        let measurement = {};
        const mc = React.render(<MeasureComponent measurement={measurement}/>, document.body);
        expect(mc).toExist();
        const domNode = React.findDOMNode(mc);
        expect(domNode).toExist();
        const domResultPanel = document.getElementById('measure-result-panel');
        expect(domResultPanel).toExist();
    });

    it('test line activation', () => {
        let newMeasureState;
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        const cmp = React.render(
            <MeasureComponent
                measurement={measurement}
                toggleMeasure={(data) => {
                    newMeasureState = data;
                }}
                lineMeasureEnabled={false} />, document.body
        );
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons.length).toBe(4);

        const lineBtn = buttons.item(0);
        lineBtn.click();

        expect(newMeasureState).toExist();
        expect(newMeasureState.lineMeasureEnabled).toBe(true);
    });

    it('test area activation', () => {
        let newMeasureState;
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        const cmp = React.render(
            <MeasureComponent
                measurement={measurement}
                toggleMeasure={(data) => {
                    newMeasureState = data;
                }}
                areaMeasureEnabled={false} />, document.body
        );
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons.length).toBe(4);

        const areaBtn = buttons.item(1);
        areaBtn.click();

        expect(newMeasureState).toExist();
        expect(newMeasureState.areaMeasureEnabled).toBe(true);
    });

    it('test bearing activation', () => {
        let newMeasureState;
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        const cmp = React.render(
            <MeasureComponent
                measurement={measurement}
                toggleMeasure={(data) => {
                    newMeasureState = data;
                }}
                bearingMeasureEnabled={false} />, document.body
        );
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons.length).toBe(4);

        const bearingBtn = buttons.item(2);
        bearingBtn.click();

        expect(newMeasureState).toExist();
        expect(newMeasureState.bearingMeasureEnabled).toBe(true);
    });

    it('test measurements resetting', () => {
        let newMeasureState;
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        const cmp = React.render(
            <MeasureComponent
                measurement={measurement}
                toggleMeasure={(data) => {
                    newMeasureState = data;
                }} />, document.body
        );
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons.length).toBe(4);

        const resetBtn = buttons.item(3);
        resetBtn.click();

        expect(newMeasureState).toExist();
        expect(newMeasureState.lineMeasureEnabled).toBe(false);
        expect(newMeasureState.areaMeasureEnabled).toBe(false);
        expect(newMeasureState.bearingMeasureEnabled).toBe(false);
        expect(newMeasureState.geomType).toBe(null);
        expect(newMeasureState.len).toBe(0);
        expect(newMeasureState.area).toBe(0);
        expect(newMeasureState.bearing).toBe(0);
    });

    it('test bearing format', () => {
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        const cmp = React.render(
            <MeasureComponent measurement={measurement}/>, document.body
        );
        expect(cmp).toExist();

        const bearingSpan = document.getElementById('measure-bearing-res');
        expect(bearingSpan).toExist();

        cmp.setProps({
            measurement: {bearing: 45}
        }, () => {
            expect(bearingSpan.innerHTML).toBe("N 45° 0' 0''  E");
        });

        cmp.setProps({
            measurement: {bearing: 135}
        }, () => {
            expect(bearingSpan.innerHTML).toBe("S 45° 0' 0''  E");
        });

        cmp.setProps({
            measurement: {bearing: 225}
        }, () => {
            expect(bearingSpan.innerHTML).toBe("S 45° 0' 0''  W");
        });

        cmp.setProps({
            measurement: {bearing: 315}
        }, () => {
            expect(bearingSpan.innerHTML).toBe("N 45° 0' 0''  W");
        });
    });
    it('test uom format area anf lenght', () => {
        let measurement = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: 'LineString',
            len: 0,
            area: 0,
            bearing: 0
        };
        const cmp = React.render(
            <MeasureComponent uom={{
                length: {unit: 'km', label: 'km'},
                area: {unit: 'sqkm', label: 'km²'}
            }} measurement={measurement}/>, document.body
        );
        expect(cmp).toExist();

        const lenSpan = document.getElementById('measure-len-res');
        expect(lenSpan).toExist();

        cmp.setProps({
            measurement: {len: 10000}
        }, () => {
            expect(lenSpan.firstChild.innerHTML).toBe("10.00");
            expect(lenSpan.lastChild.innerHTML).toBe("km");
        });

        const areaSpan = document.getElementById('measure-area-res');
        expect(areaSpan).toExist();

        cmp.setProps({
            measurement: {geomType: 'Polygon', area: 1000000}
        }, () => {
            expect(areaSpan.firstChild.innerHTML).toBe("1.00");
            expect(areaSpan.lastChild.innerHTML).toBe("km²");
        });
    });
});
