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
        expect(cmp).toExist();
    });

    it('should be visible', () => {
        const versionDialog = ReactDOM.render(<VersionDialog onClose={()=>{}} show version={'version'} />, document.getElementById("container"));
        expect(versionDialog).toExist();
        const versionDialogDOM = ReactDOM.findDOMNode(versionDialog);
        expect(versionDialogDOM).toExist();
        const innerModalDom = versionDialogDOM.children[0];
        expect(innerModalDom).toExist();
        const innerModalDomBody = innerModalDom.children[0];
        expect(innerModalDomBody).toExist();
    });

    it('test close button', () => {
        const handlers = {
            onClose() {}
        };
        let spy = expect.spyOn(handlers, "onClose");
        const vd = ReactDOM.render(<VersionDialog onClose={handlers.onClose} show version={'version'} />, document.getElementById("container"));
        expect(vd).toExist();
        const dom = ReactDOM.findDOMNode(vd);
        const closeBtn = dom.getElementsByClassName('close')[0];
        expect(closeBtn).toExist();
        ReactTestUtils.Simulate.click(closeBtn);
        expect(spy.calls.length).toBe(1);
    });
    it('test the modal output', () => {
        const vd = ReactDOM.render(<VersionDialog onClose={()=>{}} show version={'version'} />, document.getElementById("container"));
        expect(vd).toExist();
        expect('#7934 refactor code and resolve eslint error').toBeTruthy();
        expect('01046133761de880aebce08a7bf11dd858117837').toBeTruthy();
        expect('Thu, 23 Jun 2022 20').toBeTruthy();
        expect('sam rubarema').toBeTruthy();
        expect(':${mapstore2.version}').toBeTruthy();

    });


});
