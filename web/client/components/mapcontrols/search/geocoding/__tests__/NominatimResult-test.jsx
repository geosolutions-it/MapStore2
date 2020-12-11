/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import NominatimResult from '../NominatimResult';
import TestUtils from 'react-dom/test-utils';

describe("test the NominatimResult", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        var item = {
            osm_id: 1,
            display_name: "Name",
            boundingbox: []
        };
        const tb = ReactDOM.render(<NominatimResult item={item}/>, document.getElementById("container"));
        expect(tb).toExist();

    });

    it('create component without item', () => {
        const tb = ReactDOM.render(<NominatimResult />, document.getElementById("container"));
        expect(tb).toExist();
    });

    it('test click handler', () => {
        const testHandlers = {
            clickHandler: (pressed) => {return pressed; }
        };
        var item = {
            osm_id: 1,
            display_name: "Name",
            boundingbox: []
        };
        const spy = expect.spyOn(testHandlers, 'clickHandler');
        var tb = ReactDOM.render(<NominatimResult item={item} onItemClick={testHandlers.clickHandler}/>, document.getElementById("container"));
        let elem = TestUtils.findRenderedDOMComponentWithClass(tb, "search-result");

        expect(elem).toExist();
        ReactDOM.findDOMNode(elem).click();
        expect(spy.calls.length).toEqual(1);
    });
});
