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
import ShareEmbed from '../ShareEmbed';
import {head} from 'lodash';
import ReactTestUtils from 'react-dom/test-utils';

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
        const iFrameStr = "<iframe allowFullScreen style=\"border: none;\" height=\"500\" width=\"600\" src=\"" + url + "\"></iframe>";
        const cmpSharePanel = ReactDOM.render(<ShareEmbed shareUrl={url}/>, document.getElementById("container"));
        expect(cmpSharePanel).toExist();

        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(codeEmbed).toExist();
        expect(codeEmbed.innerText).toEqual(iFrameStr);

    });
    it('test forceDrawer', () => {
        const host = "http://localhost:8081/";
        const hashPart = "#/abc/def/1";
        let expectedParam = "?forceDrawer=true";
        const iFrameStr = "<iframe allowFullScreen style=\"border: none;\" height=\"500\" width=\"600\" src=\"" + host + expectedParam + hashPart + "\"></iframe>";
        const cmpSharePanel = ReactDOM.render(<ShareEmbed shareUrl={ host + hashPart }/>, document.getElementById("container"));
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "input");
        let checkbox = head(inputs.filter(i => i.type === "checkbox"));
        expect(checkbox.checked).toBe(false);
        ReactTestUtils.Simulate.change(checkbox);
        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(checkbox.checked).toBe(true);
        expect(codeEmbed).toExist();
        expect(codeEmbed.innerText).toEqual(iFrameStr);
    });
    it('test showTOCToggle prop', () => {
        const host = "http://localhost:8081/";
        const hashPart = "#/abc/def/1";
        const cmpSharePanel = ReactDOM.render(<ShareEmbed showTOCToggle={false} shareUrl={ host + hashPart }/>, document.getElementById("container"));
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "input");
        let checkboxes = inputs.filter(i => i.type === "checkbox");
        expect(checkboxes.length).toBe(0);
    });
    it('should add connection param', () => {
        const host = "http://localhost:8081/dashboard-embedded.html";
        const hashPart = "#/1";
        const expectedParam = "?connections=true";
        const iFrameStr = "<iframe allowFullScreen style=\"border: none;\" height=\"500\" width=\"600\" src=\"" + host + expectedParam + hashPart + "\"></iframe>";
        const cmpSharePanel = ReactDOM.render(
            <ShareEmbed
                shareUrl={ host + hashPart }
                showConnectionsParamToggle
            />, document.getElementById("container"));
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "input");
        const checkboxes = inputs.filter(i => i.type === "checkbox");
        expect(checkboxes[1].checked).toBe(false);
        ReactTestUtils.Simulate.change(checkboxes[1]);
        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(checkboxes[1].checked).toBe(true);
        expect(codeEmbed).toBeTruthy();
        expect(codeEmbed.innerText).toEqual(iFrameStr);
    });

    it('should load height and width from props if sizeOptions is available', () => {
        const host = "http://localhost:8081/dashboard-embedded.html";
        const hashPart = "#/1";
        const expectedParam = "?connections=true";
        const iFrameStr = "<iframe allowFullScreen style=\"border: none;\" height=\"700\" width=\"400\" src=\"" + host + expectedParam + hashPart + "\"></iframe>";
        const cmpSharePanel = ReactDOM.render(
            <ShareEmbed
                sizeOptions = {{Small: { width: 400, height: 700}}}
                shareUrl={ host + hashPart }
                showConnectionsParamToggle
            />, document.getElementById("container"));
        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "input");
        const checkboxes = inputs.filter(i => i.type === "checkbox");
        expect(checkboxes[1].checked).toBe(false);
        ReactTestUtils.Simulate.change(checkboxes[1]);
        expect(codeEmbed.innerText).toEqual(iFrameStr);
    });

    it("should show allowFullScreen if prop allowFullScreen doesnot exist", () => {
        Object.defineProperty(window.location.constructor.prototype, 'hash', {configurable: true, writable: true});
        window.location.hash = "#/dashboard/5728";
        const host = "http://localhost:8081/embedded.html";
        const hashPart = "#";
        const cmpSharePanel = ReactDOM.render(
            <ShareEmbed
                sizeOptions = {{Small: { width: 400, height: 700}}}
                shareUrl={ host + hashPart }
                showConnectionsParamToggle
            />, document.getElementById("container"));
        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(codeEmbed.innerText.includes("allowFullScreen")).toBe(true);
    });

    it("should not show allowFullScreen is prop.allowFullScreen is false", () => {
        Object.defineProperty(window.location.constructor.prototype, 'hash', {configurable: true, writable: true});
        window.location.hash = "#/geostory/5728";
        const host = "http://localhost:8081/embedded.html";
        const hashPart = "#";
        const cmpSharePanel = ReactDOM.render(
            <ShareEmbed
                sizeOptions = {{Small: { width: 400, height: 700}}}
                shareUrl={ host + hashPart }
                showConnectionsParamToggle
                allowFullScreen={false}
            />, document.getElementById("container"));
        const codeEmbed = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmpSharePanel, "code")[0]);
        expect(codeEmbed.innerText.includes("allowFullScreen")).toBe(false);
    });
});
