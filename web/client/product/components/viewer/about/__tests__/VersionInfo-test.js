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
import VersionInfo from '../VersionInfo';

describe("The VersionInfo component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('is created with defaults', () => {
        const cmp = ReactDOM.render(<VersionInfo/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();
    });

    it('test with version info', () => {
        const version = '$MapStore2';
        const message = "#7934 refactor code and resolve eslint error";
        const commit = "01046133761de880aebce08a7bf11dd858117837";
        const date = "Thu, 23 Jun 2022 20:00:02 +0300";
        const githubUrl = "https://github.com/geosolutions-it/MapStore/tree/";

        const vd = ReactDOM.render(
            <VersionInfo
                version={version}
                githubUrl={githubUrl}
                commit={commit}
                message={message}
                date={date}
            />, document.getElementById("container"));
        expect(vd).toBeTruthy();

        const versionDialogDOM = ReactDOM.findDOMNode(vd);
        expect(versionDialogDOM).toBeTruthy();
        const innerModalDom = versionDialogDOM.children[0];
        expect(innerModalDom).toBeTruthy();
        const innerModalDomBody = innerModalDom.children[0];
        expect(innerModalDomBody).toBeTruthy();
        const infoclass = versionDialogDOM.querySelectorAll('.version-info .info-label');
        expect(infoclass).toBeTruthy();

        const versionValue = document.querySelector('.v_version');
        const messageValue = document.querySelector('.v_message');
        const commitValue = document.querySelector('.v_commit');
        const dateValue = document.querySelector('.v_date');
        const githubUrlValue = document.querySelector('.v_githubUrl');

        expect(versionValue.textContent.trim()).toBe(version);
        expect(messageValue.textContent.trim()).toBe(message);
        expect(commitValue.textContent.trim()).toBe(commit);
        expect(commitValue.innerHTML.trim()).toBe(`<a href="https://github.com/geosolutions-it/MapStore/tree/${commit}" target="_blank" class="v_githubUrl">${commit}</a>`);
        expect(dateValue.textContent.trim()).toBe(date);
        expect(githubUrlValue.textContent.trim()).toBe(commit);
    });
});
