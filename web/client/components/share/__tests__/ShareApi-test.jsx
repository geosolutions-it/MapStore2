/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ShareApi from '../ShareApi';
import ReactTestUtils from 'react-dom/test-utils';

describe("The ShareAPI component", () => {
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
        const cmpSharePanel = ReactDOM.render(<ShareApi/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

    });

    it('should have the address url in the textarea field', () => {
        const url = location.href;
        const shareConfigUrl = 'configurl';

        const cmpSharePanel = ReactDOM.render(<ShareApi shareUrl={url} shareConfigUrl={shareConfigUrl}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(codeEmbed).toExist();
        expect(codeEmbed.innerText.indexOf(url) !== -1).toBe(true);
        expect(codeEmbed.innerText.indexOf(shareConfigUrl) !== -1).toBe(true);
    });

    it('add version to API template', () => {
        const url = location.href;
        const shareConfigUrl = 'configurl';
        const version = '18e36c9e2ce1cbf57648907ec177e02f0118764d';
        const cmpSharePanel = ReactDOM.render(<ShareApi shareUrl={url} shareConfigUrl={shareConfigUrl} version={version}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(codeEmbed).toExist();
        expect(codeEmbed.innerText.indexOf('?' + version) !== -1).toBe(true);
    });

    it('add version ${mapstore2.version} to API template', () => {
        const url = location.href;
        const shareConfigUrl = 'configurl';
        const version = '${mapstore2.version}';
        const cmpSharePanel = ReactDOM.render(<ShareApi shareUrl={url} shareConfigUrl={shareConfigUrl} version={version}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(codeEmbed).toExist();
        expect(codeEmbed.innerText.indexOf('?' + version) !== -1).toBe(false);
    });

    it('add no-version to API template', () => {
        const url = location.href;
        const shareConfigUrl = 'configurl';
        const version = 'no-version';
        const cmpSharePanel = ReactDOM.render(<ShareApi shareUrl={url} shareConfigUrl={shareConfigUrl} version={version}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(codeEmbed).toExist();
        expect(codeEmbed.innerText.indexOf('?' + version) !== -1).toBe(false);
    });

});
