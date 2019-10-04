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
const MousePositionLabelDMS = require('../MousePositionLabelDMS');
const ReactTestUtils = require('react-dom/test-utils');
const {IntlProvider} = require('react-intl');

describe('MousePositionLabelDMS', () => {
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
            <MousePositionLabelDMS/>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        expect(cmpDom.textContent).toBe("Lat: ° ' '' Lng: ° ' ''");

        let spans = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmp, "span");
        expect(spans.length).toBe(16);
        expect(spans[1].textContent).toBe("Lat: ");
        expect(spans[2].textContent).toBe("");
        expect(spans[3].textContent).toBe("° ");
        expect(spans[4].textContent).toBe("");
        expect(spans[5].textContent).toBe("\' ");
        expect(spans[6].textContent).toBe("");
        expect(spans[7].textContent).toBe("\'\'");

        expect(spans[8].className).toBe("mouseposition-separator");

        expect(spans[9].textContent).toBe(" Lng: ");
        expect(spans[10].textContent).toBe("");
        expect(spans[11].textContent).toBe("° ");
        expect(spans[12].textContent).toBe("");
        expect(spans[13].textContent).toBe("\' ");
        expect(spans[14].textContent).toBe("");
        expect(spans[15].textContent).toBe("\'\'");
    });

    it('a position with defaults', () => {

        const cmp = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: 28.3, lat: 13.5333333}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.textContent).toBe("Lat: 13° 31' 60.00'' Lng: 028° 18' 00.00''");
    });

    it('position with no rounding but trunc of latD and lngD', () => {

        const cmp = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: 10.475013256072998, lat: 43.70726776739903}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        // it should be 010° 28' 30.05'' instead of 010° 29' 00''
        expect(cmpDom.textContent).toBe("Lat: 43° 42' 26.16'' Lng: 010° 28' 30.05''");
    });

    it('position with negative lat and lng correctly truncated ladD e lngD', () => {

        const cmp = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: -0.006, lat: -0.006}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmp).toExist();
        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        // it should be Lat: -00° 00' 21.60'' Lng: -000° 00' 21.60'' instead of Lat: -01° 00' 21.60'' Lng: -001° 00' 21.60''
        expect(cmpDom.textContent).toBe("Lat: -00° 00' 21.60'' Lng: -000° 00' 21.60''");
    });
    it('test sign changes when crossing greenwich meridian and equator parallel and latD lngD are 0', () => {
        const cmp = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: -0.006, lat: -0.006}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmp).toExist();
        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        // it should be Lat: -00° 00' 21.60'' Lng: -000° 00' 21.60''
        expect(cmpDom.textContent).toBe("Lat: -00° 00' 21.60'' Lng: -000° 00' 21.60''");

        const cmpPositive = ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: 0.006, lat: 0.006}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        expect(cmpPositive).toExist();
        const cmpDomPositive = ReactDOM.findDOMNode(cmpPositive);
        expect(cmpDomPositive).toExist();

        // it should be Lat: 00° 00' 21.60'' Lng: 000° 00' 21.60'' instead of Lat: -00° 00' 21.60'' Lng: -000° 00' 21.60''
        expect(cmpDomPositive.textContent).toBe("Lat: 00° 00' 21.60'' Lng: 000° 00' 21.60''");
    });
});
