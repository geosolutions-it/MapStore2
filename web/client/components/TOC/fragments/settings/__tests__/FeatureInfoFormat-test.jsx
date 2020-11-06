/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ReactDOM = require('react-dom');
var ReactTestUtils = require('react-dom/test-utils');
var FeatureInfoFormat = require('../FeatureInfoFormat');

var expect = require('expect');

describe('test Layer Properties FeatureInfoFormat module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests FeatureInfoFormat component', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'shapefile',
            url: 'fakeurl'
        };
        const label = "label";
        // wrap in a stateful component, stateless components render return null
        // see: https://facebook.github.io/react/docs/top-level-api.html#reactdom.render
        const comp = ReactDOM.render(<FeatureInfoFormat element={l} label={label}/>, document.getElementById("container"));
        expect(comp).toExist();
        const span = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "span" );
        expect(span).toExist();
        expect(span.length).toBe(0);
    });
    it('tests FeatureInfoFormat component for wms', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            featureInfo: {
                format: 'JSON'
            }
        };
        const label = "label";
        const handlers = {
            onChange() {}
        };
        let spy = expect.spyOn(handlers, "onChange");
        // wrap in a stateful component, stateless components render return null
        // see: https://facebook.github.io/react/docs/top-level-api.html#reactdom.render
        const comp = ReactDOM.render(<FeatureInfoFormat element={l} label={label} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toExist();
        const span = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "span" );
        expect(span).toExist();
        expect(span.length).toBe(2);
        span[1].click();
        const li = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "li" );
        expect(li).toExist();
        li[0].click();
        expect(spy.calls.length).toBe(1);
    });
    it('tests FeatureInfoFormat component for wms using generalInfoFormat', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const generalInfoFormat = "text/html";
        const label = "label";
        const comp = ReactDOM.render(<FeatureInfoFormat element={l} label={label} generalInfoFormat={generalInfoFormat} onChange={() => {}}/>, document.getElementById("container"));
        expect(comp).toExist();
        const div = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "div" );
        expect(div[2]).toExist();
        expect(div[2].textContent).toBe("HTML");

    });
});
