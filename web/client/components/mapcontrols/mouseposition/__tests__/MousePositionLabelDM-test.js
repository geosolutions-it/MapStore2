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
const MousePositionLabelDM = require('../MousePositionLabelDM');
const ReactTestUtils = require('react-dom/test-utils');
const {IntlProvider} = require('react-intl');

describe('MousePositionLabelDM', () => {
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
            <MousePositionLabelDM/>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.textContent).toBe("Lat: ° ' Lng: ° ' ");

        let spans = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmp, "span");
        expect(spans.length).toBe(11);
        expect(spans[1].textContent).toBe("Lat: ");
        expect(spans[2].textContent).toBe("");
        expect(spans[3].textContent).toBe("° ");
        expect(spans[4].textContent).toBe("");
        expect(spans[5].textContent).toBe("\' ");

        expect(spans[6].textContent).toBe("Lng: ");
        expect(spans[7].textContent).toBe("");
        expect(spans[8].textContent).toBe("° ");
        expect(spans[9].textContent).toBe("");
        expect(spans[10].textContent).toBe("\' ");
    });

    it('a position with defaults', () => {

        const cmp = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDM
                    position={{lng: 28.3, lat: 13.5333333}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.textContent).toBe("Lat: 13° 32.000' Lng: 028° 18.000' ");
    });

    it('position with no rounding but flooring of latD and lngD', () => {

        const cmp = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDM
                    position={{lng: 10.475013256072998, lat: 43.70726776739903}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        // it should be 010° 28' 30.05'' instead of 010° 29' 00''
        expect(cmpDom.textContent).toBe("Lat: 43° 42.436' Lng: 010° 28.501' ");
    });
});
