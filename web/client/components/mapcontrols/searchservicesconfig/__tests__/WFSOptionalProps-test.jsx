/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import WFSOptionalProps from '../WFSOptionalProps';

const mouseMove = (x, y, node) => {
    const doc = node ? node.ownerDocument : document;
    const evt = doc.createEvent('MouseEvents');
    evt.initMouseEvent('mousemove', true, true, window,
        0, 0, 0, x, y, false, false, false, false, 0, null);
    doc.dispatchEvent(evt);
    return evt;
};

const simulateMovementFromTo = (drag, fromX, fromY, toX, toY) => {
    const node = ReactDOM.findDOMNode(drag);
    console.log("node", node)
    TestUtils.Simulate.mouseDown(node, { clientX: fromX, clientY: fromY });
    mouseMove(toX, toY, node);
    TestUtils.Simulate.mouseUp(node);
};

describe.only("test ResultProps component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test WFSOptionalProps creation', () => {
        const wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        const labels = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, "control-label");
        expect(labels.length).toBe(3);
    });

    it('test WFSOptionalProps with preconfigured service', () => {
        let service = {
            type: "wfs",
            name: "Tiger road",
            subTitle: "Roads",
            priority: 3,
            options: {
                sortBy: "NAME",
                // maxFeatures: 11
                srsName: "EPSG:4326"
                // maxZoomLevel: 8
            }
        };
        let wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element service={service}/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        const labels = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, "control-label");
        expect(labels.length).toBe(3);
        expect(labels[0].innerText).toBe('search.s_sort');
        expect(labels[1].innerText).toBe('search.s_max_features');
        expect(labels[2].innerText).toBe('search.s_max_zoom');
        const inputs = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, 'form-control');
        expect(inputs.length).toBe(1);
        expect(inputs[0].value).toBe('NAME');
        let sliders = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, 'slider-label');
        expect(sliders.length).toBe(2);
        let maxFeatures = sliders[0].innerText;
        let maxZoomLevel = sliders[1].innerText;
        expect(maxFeatures).toBe('1');
        expect(maxZoomLevel).toBe('1');

        service = {
            type: "wfs",
            name: "Tiger road",
            subTitle: "Roads",
            priority: 3,
            options: {
                sortBy: "NAME",
                maxFeatures: 11,
                srsName: "EPSG:4326",
                maxZoomLevel: 8
            }
        };
        wfsOptionalProps = ReactDOM.render(<WFSOptionalProps.Element service={service}/>, document.getElementById("container"));
        expect(wfsOptionalProps).toExist();
        sliders = TestUtils.scryRenderedDOMComponentsWithClass(wfsOptionalProps, 'slider-label');
        maxFeatures = sliders[0].innerText;
        maxZoomLevel = sliders[1].innerText;
        expect(maxFeatures).toBe('11');
        expect(maxZoomLevel).toBe('8');
    });

});
