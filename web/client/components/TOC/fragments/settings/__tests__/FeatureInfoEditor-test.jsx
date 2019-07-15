/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const expect = require('expect');
const ReactDOM = require('react-dom');
const FeatureInfoEditor = require('../FeatureInfoEditor');
const TestUtils = require('react-dom/test-utils');

describe("test FeatureInfoEditor", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test rendering edit modal', () => {
        ReactDOM.render(<FeatureInfoEditor showEditor/>, document.getElementById("container"));
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(1);
    });

    it('test rendering close x', () => {
        const template = '<p>html</p>';

        const testHandlers = {
            onShowEditor: () => {},
            onChange: () => {}
        };
        const spyOnShowEditor = expect.spyOn(testHandlers, 'onShowEditor');
        const spyOnChange = expect.spyOn(testHandlers, 'onChange');

        const cmp = ReactDOM.render(<FeatureInfoEditor
            onChange={testHandlers.onChange}
            onShowEditor={testHandlers.onShowEditor}
            showEditor/>, document.getElementById("container"));
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(1);

        // edit template
        const editor = cmp.quill.getEditor();
        editor.clipboard.dangerouslyPasteHTML(template);
        expect(spyOnChange).toNotHaveBeenCalled();
        spyOnChange.reset();

        const btns = document.getElementsByClassName('ms-header-btn');
        expect(btns.length).toBe(2);
        TestUtils.Simulate.click(btns[1]);
        expect(spyOnShowEditor).toHaveBeenCalled();

        expect(spyOnShowEditor).toHaveBeenCalled();
        expect(spyOnChange.calls[0].arguments).toEqual([ 'featureInfo', { template } ]);
    });

    it('test rendering close button', () => {

        const template = '<p>html</p>';

        const testHandlers = {
            onShowEditor: () => {},
            onChange: () => {}
        };

        const spyOnShowEditor = expect.spyOn(testHandlers, 'onShowEditor');
        const spyOnChange = expect.spyOn(testHandlers, 'onChange');

        const cmp = ReactDOM.render(<FeatureInfoEditor
            onChange={testHandlers.onChange}
            onShowEditor={testHandlers.onShowEditor}
            showEditor/>, document.getElementById("container"));
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(1);

        // edit template
        const editor = cmp.quill.getEditor();
        editor.clipboard.dangerouslyPasteHTML(template);
        expect(spyOnChange).toNotHaveBeenCalled();
        spyOnChange.reset();

        const btns = document.getElementsByClassName('btn');
        expect(btns.length).toBe(1);
        TestUtils.Simulate.click(btns[0]);
        expect(spyOnShowEditor).toHaveBeenCalled();
        expect(spyOnChange.calls[0].arguments).toEqual([ 'featureInfo', { template } ]);
    });

});
