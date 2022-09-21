/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import FeatureInfoEditor from '../FeatureInfoEditor';

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

    it('test rendering close x', (done) => {

        const template = '<p>html</p>';

        ReactDOM.render(<FeatureInfoEditor
            onReady={(quill) => {
                try {
                    // edit template
                    const editor = quill.getEditor();
                    editor.clipboard.dangerouslyPasteHTML(template);
                    const btns = document.getElementsByClassName('ms-header-btn');
                    expect(btns.length).toBe(2);
                    TestUtils.Simulate.click(btns[1]);
                } catch (e) {
                    done(e);
                }
            }}
            onShowEditor={(value) => {
                expect(value).toBe(false);
            }}
            onChange={(key, value) => {
                if (value.template === template) {
                    expect(key).toBe('featureInfo');
                    expect(value).toEqual({ template });
                    done();
                }
            }}
            showEditor/>, document.getElementById("container"));

        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(1);

    });

    it('test rendering close button', (done) => {

        const template = '<p>html</p>';

        ReactDOM.render(<FeatureInfoEditor
            onReady={(quill) => {
                try {
                    // edit template
                    const editor = quill.getEditor();
                    editor.clipboard.dangerouslyPasteHTML(template);
                    const btns = document.getElementsByClassName('btn');
                    expect(btns.length).toBe(1);
                    TestUtils.Simulate.click(btns[0]);
                } catch (e) {
                    done(e);
                }
            }}
            onShowEditor={(value) => {
                expect(value).toBe(false);
            }}
            onChange={(key, value) => {
                if (value.template === template) {
                    expect(key).toBe('featureInfo');
                    expect(value).toEqual({ template });
                    done();
                }
            }}
            showEditor
        />, document.getElementById("container"));
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(1);
    });

});
