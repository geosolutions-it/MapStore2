/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import MousePositionLabelDMS from '../MousePositionLabelDMS';
import { IntlProvider } from 'react-intl';

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
        ReactDOM.render(
            <MousePositionLabelDMS/>
            , document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();

        let spans = cmpDom.querySelectorAll(':scope > span');
        expect(spans.length).toBe(2);
        expect(spans[0].textContent).toBe("Lat: 0° 0' 0''");
        expect(spans[1].textContent).toBe("Lng: 0° 0' 0''");
    });

    it('a position with defaults', () => {

        ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: 28.3, lat: 13.5333333}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();

        let spans = cmpDom.querySelectorAll(':scope > span');
        expect(spans.length).toBe(2);
        expect(spans[0].textContent).toBe("Lat: 13° 31' 60.00''");
        expect(spans[1].textContent).toBe("Lng: 028° 18' 00.00''");
    });

    it('position with no rounding but trunc of latD and lngD', () => {
        ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: 10.475013256072998, lat: 43.70726776739903}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();

        let spans = cmpDom.querySelectorAll(':scope > span');
        expect(spans.length).toBe(2);
        expect(spans[0].textContent).toBe("Lat: 43° 42' 26.16''");
        expect(spans[1].textContent).toBe("Lng: 010° 28' 30.05''");
    });

    it('position with negative lat and lng correctly truncated ladD e lngD', () => {

        ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: -0.006, lat: -0.006}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();

        let spans = cmpDom.querySelectorAll(':scope > span');
        expect(spans.length).toBe(2);
        // it should be Lat: - 00° 00' 21.60'' Lng: - 000° 00' 21.60'' instead of Lat: -01° 00' 21.60'' Lng: -001° 00' 21.60''
        expect(spans[0].textContent).toBe("Lat: - 00° 00' 21.60''");
        expect(spans[1].textContent).toBe("Lng: - 000° 00' 21.60''");
    });

    it('test sign changes when crossing greenwich meridian and equator parallel and latD lngD are 0', () => {
        ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: -0.006, lat: -0.006}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();

        let spans = cmpDom.querySelectorAll(':scope > span');
        expect(spans.length).toBe(2);

        expect(spans[0].textContent).toBe("Lat: - 00° 00' 21.60''");
        expect(spans[1].textContent).toBe("Lng: - 000° 00' 21.60''");

        // it should be Lat: - 00° 00' 21.60'' Lng: - 000° 00' 21.60''

        ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMS
                    position={{lng: 0.006, lat: 0.006}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        const cmpDomPositive = document.getElementById("container");
        expect(cmpDomPositive).toExist();

        spans = cmpDomPositive.querySelectorAll(':scope > span');
        expect(spans.length).toBe(2);

        expect(spans[0].textContent).toBe("Lat: 00° 00' 21.60''");
        expect(spans[1].textContent).toBe("Lng: 000° 00' 21.60''");

        // it should be Lat: 00° 00' 21.60'' Lng: 000° 00' 21.60'' instead of Lat: -00° 00' 21.60'' Lng: -000° 00' 21.60''
    });
});
