/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ShareCopyToClipboard from '../ShareCopyToClipboard';
import ReactTestUtils from 'react-dom/test-utils';

let prompt;

describe('The ShareCopyToClipboard component', () => {
    beforeEach((done) => {
        prompt = global.prompt;
        global.prompt = () => true;
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        global.prompt = prompt;
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test copy function of clipboard', (done) => {
        const SHARE_URL = 'http://my-link';
        const onCopy = (sharedLink) => {
            expect(sharedLink).toBe(SHARE_URL);
            done();
        };
        ReactDOM.render(<ShareCopyToClipboard
            shareUrl={SHARE_URL}
            onCopy={onCopy}
        />, document.getElementById("container"));
        const button = document.getElementsByClassName('btn-primary')[0];
        expect(button).toExist();
        ReactTestUtils.Simulate.click(button);
    });
});
