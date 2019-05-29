/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ShareEmbed = require('../ShareEmbed');
const {head} = require('lodash');
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
        const cmpSharePanel = ReactDOM.render(<ShareEmbed/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

    });

    it('should have the address url in the textarea field', () => {
        const url = location.href;
        const iFrameStr = "<iframe style=\"border: none;\" height=\"400\" width=\"600\" src=\"" + url + "\"></iframe>";
        const cmpSharePanel = ReactDOM.render(<ShareEmbed shareUrl={url}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const textareaEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "textarea")[0]);
        expect(textareaEmbed).toExist();
        expect(textareaEmbed.value).toEqual(iFrameStr);

    });
    it('test forceDrawer', () => {
        const host = "http://localhost:8081/";
        const hashPart = "#/abc/def/1";
        let expectedParam = "?forceDrawer=true";
        const iFrameStr = "<iframe style=\"border: none;\" height=\"400\" width=\"600\" src=\"" + host + expectedParam + hashPart + "\"></iframe>";
        const cmpSharePanel = ReactDOM.render(<ShareEmbed shareUrl={ host + hashPart }/>, document.getElementById("container"));
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "input");
        let checkbox = head(inputs.filter(i => i.type === "checkbox"));
        expect(checkbox.checked).toBe(false);
        ReactTestUtils.Simulate.change(checkbox);
        const textareaEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "textarea")[0]);
        expect(checkbox.checked).toBe(true);
        expect(textareaEmbed).toExist();
        expect(textareaEmbed.value).toEqual(iFrameStr);
    });
    it('test showTOCToggle prop', () => {
        const host = "http://localhost:8081/";
        const hashPart = "#/abc/def/1";
        const cmpSharePanel = ReactDOM.render(<ShareEmbed showTOCToggle={false} shareUrl={ host + hashPart }/>, document.getElementById("container"));
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "input");
        let checkboxes = inputs.filter(i => i.type === "checkbox");
        expect(checkboxes.length).toBe(0);
    });
});
