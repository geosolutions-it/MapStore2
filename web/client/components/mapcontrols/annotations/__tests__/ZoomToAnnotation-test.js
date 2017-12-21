/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const ZoomToAnnotation = require('../ZoomToAnnotation');

const TestUtils = require('react-dom/test-utils');

describe("test the ZoomToAnnotation Button", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test default properties', () => {
        const viewer = ReactDOM.render(<ZoomToAnnotation />, document.getElementById("container"));
        expect(viewer).toExist();
        const viewerNode = ReactDOM.findDOMNode(viewer);
        expect(viewerNode).toExist();
    });

    it('test annotation zoom', () => {
        const testHandlers = {
            onZoom: () => {}
        };
        const annotation = {
            geometry: {
                coordinates: [13, 45]
            }
        };

        const spyZoom = expect.spyOn(testHandlers, 'onZoom');
        const viewer = ReactDOM.render(<ZoomToAnnotation annotation={annotation} onZoom={testHandlers.onZoom}/>, document.getElementById("container"));
        expect(viewer).toExist();
        let zoomButton = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithTag(viewer, "button")[0]);

        expect(zoomButton).toExist();
        TestUtils.Simulate.click(zoomButton);

        expect(spyZoom.calls.length).toEqual(1);
    });
});
