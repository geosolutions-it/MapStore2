/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const MousePositionLabelDMSNW = require('../MousePositionLabelDMSNW');
const ReactTestUtils = require('react-dom/test-utils');
const {IntlProvider} = require('react-intl');

describe('MousePositionLabelDMSNW', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks default', () => {

        const cmp = ReactDOM.render(
            <MousePositionLabelDMSNW/>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.textContent).toBe("° ' '' S ° ' '' W");


        let spans = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmp, "span");
        expect(spans.length).toBe(13);
        expect(spans[1].innerText).toBe("");
        expect(spans[2].innerText).toBe("° ");
        expect(spans[3].innerText).toBe("");
        expect(spans[4].innerText).toBe("\' ");
        expect(spans[5].innerText).toBe("");
        expect(spans[6].innerText).toBe("\'\' S ");

        expect(spans[7].innerText).toBe("");
        expect(spans[8].innerText).toBe("° ");
        expect(spans[9].innerText).toBe("");
        expect(spans[10].innerText).toBe("\' ");
        expect(spans[11].innerText).toBe("");
        expect(spans[12].innerText).toBe("\'\' W");
    });

    it('a position with defaults', () => {

        const cmp = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMSNW
                    position={{lng: 28.3, lat: 13.5333333}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.textContent).toBe("13° 31' 60.00'' N 028° 18' 00.00'' E");
    });

    it('position with no rounding but flooring of latD and lngD', () => {

        const cmp = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMSNW
                    position={{lng: 10.475013256072998, lat: 43.70726776739903}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        // it should be 010° 28' 30.05'' instead of 010° 29' 00''
        expect(cmpDom.textContent).toBe("43° 42' 26.16'' N 010° 28' 30.05'' E");
    });
});
