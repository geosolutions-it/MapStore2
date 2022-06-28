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
import ReactTestUtils from 'react-dom/test-utils';
import VersionDialog from '../VersionDialog';

describe("The VersionDialog component", () => {
    beforeEach((done) => {
        window.__COMMIT_DATA__ = `Message: #7934 refactor code and resolve eslint error\n
                                    Commit: 01046133761de880aebce08a7bf11dd858117837\n
                                    Date: Thu, 23 Jun 2022 20:00:02 +0300\n
                                    Author: sam rubarema`;
        window.__COMMITHASH__ = '123wwtwtwtttwtt';

        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('is created with defaults', () => {
        const cmp = ReactDOM.render(<VersionDialog/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();
    });

    it('should be visible', () => {
        const versionDialog = ReactDOM.render(<VersionDialog onClose={()=>{}} show version={'version'} />, document.getElementById("container"));
        expect(versionDialog).toBeTruthy();
        const versionDialogDOM = ReactDOM.findDOMNode(versionDialog);
        expect(versionDialogDOM).toBeTruthy();
        const innerModalDom = versionDialogDOM.children[0];
        expect(innerModalDom).toBeTruthy();
        const innerModalDomBody = innerModalDom.children[0];
        expect(innerModalDomBody).toBeTruthy();
        const infoclass = versionDialogDOM.querySelectorAll('version-info, info-label');
        expect(infoclass).toBeTruthy();
        const versionClass = versionDialogDOM.querySelector('.application-version-label');
        expect(versionClass).toBeTruthy();
    });

    it('test close button', () => {
        const handlers = {
            onClose() {}
        };
        let spy = expect.spyOn(handlers, "onClose");
        const vd = ReactDOM.render(<VersionDialog onClose={handlers.onClose} show version={'version'} />, document.getElementById("container"));
        expect(vd).toBeTruthy();
        const dom = ReactDOM.findDOMNode(vd);
        const closeBtn = dom.getElementsByClassName('close')[0];
        expect(closeBtn).toBeTruthy();
        ReactTestUtils.Simulate.click(closeBtn);
        expect(spy.calls.length).toBe(1);
    });
    it('test the modal output', () => {
        const version = '$MapStore2';
        const vd = ReactDOM.render(<VersionDialog onClose={()=>{}} show version={version} />, document.getElementById("container"));
        expect(vd).toBeTruthy();
        const versionclass = document.querySelector(".version-info");
        expect(versionclass.textContent).toBe('version.label:$MapStore2');
        const commit = document.querySelector('#commit');
        expect(commit.textContent.trim()).toBe('01046133761de880aebce08a7bf11dd858117837');
        const date = document.querySelector('#date');
        expect(date.textContent.trim()).toBe('Thu, 23 Jun 2022 20');
        const author = document.querySelector('#author');
        expect(author.textContent.trim()).toBe('sam rubarema');

    });


});
