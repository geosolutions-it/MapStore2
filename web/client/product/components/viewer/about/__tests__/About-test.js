/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import AboutComp from '../About';

describe("The About component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test about plugin content/version info', () => {
        const cmp = ReactDOM.render(<AboutComp enabled />, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        const aboutComNodes = document.querySelector("#mapstore-about .modal-body div").childNodes;
        expect(aboutComNodes.length).toEqual(2);
        const versionInfoCmp = document.querySelector("#mapstore-about .version-panel");
        expect(versionInfoCmp).toBeTruthy();
        const aboutContentCmp = document.querySelector("#mapstore-about .about-content-section");
        expect(aboutContentCmp).toBeTruthy();
    });
    it('test hide version info in about plugin and showing only content section', () => {
        const cmp = ReactDOM.render(<AboutComp enabled showVersionInfo={false} />, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        const aboutComNodes = document.querySelector("#mapstore-about .modal-body div").childNodes;
        expect(aboutComNodes.length).toEqual(1);
        const versionInfoCmp = document.querySelector("#mapstore-about .version-panel");
        expect(versionInfoCmp).toBeFalsy();
        const aboutContentCmp = document.querySelector("#mapstore-about .about-content-section");
        expect(aboutContentCmp).toBeTruthy();
    });
    it('test hide content section in about plugin and showing only version info section', () => {
        const cmp = ReactDOM.render(<AboutComp enabled showAboutContent={false} />, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        const aboutComNodes = document.querySelector("#mapstore-about .modal-body div").childNodes;
        expect(aboutComNodes.length).toEqual(1);
        const versionInfoCmp = document.querySelector("#mapstore-about .version-panel");
        expect(versionInfoCmp).toBeTruthy();
        const aboutContentCmp = document.querySelector("#mapstore-about .about-content-section");
        expect(aboutContentCmp).toBeFalsy();
    });
});
