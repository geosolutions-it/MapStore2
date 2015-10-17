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

    it('test creation of measurement result grid UI ', () => {
        let measurement = {};
        const mc = React.render(<MeasureComponent measurement={measurement}/>, document.body);
        expect(mc).toExist();
        const domNode = React.findDOMNode(mc);
        expect(domNode).toExist();
        const domResultGrid = document.getElementById('measure-result-grid');
        expect(domResultGrid).toExist();
    });

    it('test formated display of measurement results ', () => {
        let measurement = {
            len: 8.8823,
            area: 16.16123,
            bearing: 32.321222
        };
        const mc = React.render(<MeasureComponent measurement={measurement}/>, document.body);
        expect(mc).toExist();

        const domLenResult = document.getElementById('measure-len-res');
        expect(domLenResult.getElementsByTagName("SPAN")[0].innerHTML).toBe('8.88');

        const domAreaResult = document.getElementById('measure-area-res');
        expect(domAreaResult.getElementsByTagName("SPAN")[0].innerHTML).toBe('16.16');

        const domBearingResult = document.getElementById('measure-bearing-res');
        expect(domBearingResult.innerHTML).toBe('N 32° 19\' 16\'\'  E');
    });
});
