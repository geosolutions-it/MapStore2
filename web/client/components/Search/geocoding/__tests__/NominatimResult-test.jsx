/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var NominatimResult = require('../NominatimResult');


describe("test the NominatimResult", () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        var item = {
            display_name: "Name",
            boundingbox: []
        };
        const tb = React.render(<NominatimResult item={item}/>, document.body);
        expect(tb).toExist();

    });

    it('create component without item', () => {
        const tb = React.render(<NominatimResult />, document.body);
        expect(tb).toExist();
    });

    it('test click handler', () => {
        var TestUtils = React.addons.TestUtils;
        const testHandlers = {
            clickHandler: (pressed) => {return pressed; }
        };
        var item = {
            display_name: "Name",
            boundingbox: []
        };
        const spy = expect.spyOn(testHandlers, 'clickHandler');
        var tb = React.render(<NominatimResult item={item} onItemClick={testHandlers.clickHandler}/>, document.body);
        let elem = TestUtils.findRenderedDOMComponentWithClass(tb, "search-result");

        expect(elem).toExist();
        React.findDOMNode(elem).click();
        expect(spy.calls.length).toEqual(1);
    });
});
