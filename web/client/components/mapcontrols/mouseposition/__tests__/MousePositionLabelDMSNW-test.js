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
import MousePositionLabelDMSNW from '../MousePositionLabelDMSNW';
import { IntlProvider } from 'react-intl';

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
        ReactDOM.render(
            <MousePositionLabelDMSNW/>
            , document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();
        const mainSpans = cmpDom.querySelectorAll(':scope > span');
        expect(mainSpans.length).toBe(2);

        expect(mainSpans[0].textContent).toBe("Lat: °  '   '' S");
        expect(mainSpans[1].textContent).toBe("Lng: °    '  '' W");

        expect(mainSpans[0].textContent).toContain("Lat:");
        expect(mainSpans[0].textContent).toContain("°");
        expect(mainSpans[0].textContent).toContain("'");
        expect(mainSpans[0].textContent).toContain("''");
        expect(mainSpans[0].textContent).toContain("S");

        expect(mainSpans[1].textContent).toContain("Lng:");
        expect(mainSpans[1].textContent).toContain("°");
        expect(mainSpans[1].textContent).toContain("'");
        expect(mainSpans[1].textContent).toContain("''");
        expect(mainSpans[1].textContent).toContain("W");
    });

    it('a position with defaults', () => {
        ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMSNW
                    position={{lng: 28.3, lat: 13.5333333}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();

        const mainSpans = cmpDom.querySelectorAll(':scope > span');
        expect(mainSpans.length).toBe(2);

        expect(mainSpans[0].textContent).toBe("Lat: 13° 31 '  60.00 '' N");
        expect(mainSpans[1].textContent).toBe("Lng: 028° 18   ' 00.00 '' E");
    });

    it('position with no rounding but flooring of latD and lngD', () => {
        ReactDOM.render(
            <IntlProvider>
                <MousePositionLabelDMSNW
                    position={{lng: 10.475013256072998, lat: 43.70726776739903}}
                />
            </IntlProvider>
            , document.getElementById("container"));
        const cmpDom = document.getElementById("container");
        expect(cmpDom).toExist();

        const mainSpans = cmpDom.querySelectorAll(':scope > span');
        expect(mainSpans.length).toBe(2);
        expect(mainSpans[0].textContent).toBe("Lat: 43° 42 '  26.16 '' N");
        expect(mainSpans[1].textContent).toBe("Lng: 010° 28   ' 30.05 '' E");
        // it should be 010° 28' 30.05'' instead of 010° 29' 00''
    });
});
