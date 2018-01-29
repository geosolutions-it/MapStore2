/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ShareApi = require('../ShareApi');
const ReactTestUtils = require('react-dom/test-utils');

describe("The ShareEmbed component", () => {
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

        const textareaEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "textarea")[0]);
        expect(textareaEmbed).toExist();
        expect(textareaEmbed.value.indexOf(url) !== -1).toBe(true);
        expect(textareaEmbed.value.indexOf(shareConfigUrl) !== -1).toBe(true);
    });

    it('add version to API template', () => {
        const url = location.href;
        const shareConfigUrl = 'configurl';
        const version = '18e36c9e2ce1cbf57648907ec177e02f0118764d';
        const cmpSharePanel = ReactDOM.render(<ShareApi shareUrl={url} shareConfigUrl={shareConfigUrl} version={version}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const textareaEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "textarea")[0]);
        expect(textareaEmbed).toExist();
        expect(textareaEmbed.value.indexOf('?' + version) !== -1).toBe(true);
    });

    it('add version ${mapstore2.version} to API template', () => {
        const url = location.href;
        const shareConfigUrl = 'configurl';
        const version = '${mapstore2.version}';
        const cmpSharePanel = ReactDOM.render(<ShareApi shareUrl={url} shareConfigUrl={shareConfigUrl} version={version}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const textareaEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "textarea")[0]);
        expect(textareaEmbed).toExist();
        expect(textareaEmbed.value.indexOf('?' + version) !== -1).toBe(false);
    });

    it('add no-version to API template', () => {
        const url = location.href;
        const shareConfigUrl = 'configurl';
        const version = 'no-version';
        const cmpSharePanel = ReactDOM.render(<ShareApi shareUrl={url} shareConfigUrl={shareConfigUrl} version={version}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const textareaEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "textarea")[0]);
        expect(textareaEmbed).toExist();
        expect(textareaEmbed.value.indexOf('?' + version) !== -1).toBe(false);
    });

});
