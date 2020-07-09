/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import VisualStyleEditor from '../VisualStyleEditor';
import expect from 'expect';

describe('VisualStyleEditor', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults', () => {
        ReactDOM.render(<VisualStyleEditor />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });
    it('should trigger on change when parser and code are available', (done) => {
        ReactDOM.render(<VisualStyleEditor
            format="css"
            code={`
                    @mode 'Flat';

                    * {
                        fill: #ff0000;
                    }`}
            onChange={(newCode) => {
                try {
                    expect(newCode).toBeTruthy();
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });
    it('should use default JSON style if available', (done) => {
        ReactDOM.render(<VisualStyleEditor
            format="css"
            code={`
                    @mode 'Flat';

                    * {
                        fill: #ff0000;
                    }`}
            defaultStyleJSON={{
                name: '',
                rules: [{
                    name: '',
                    symbolizers: [{
                        kind: 'Fill',
                        color: '#00ff00'
                    }]
                }]
            }}
            onChange={(newCode, styleJSON) => {
                try {
                    expect(styleJSON.rules[0].symbolizers[0].color).toBe('#00ff00');
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });
    it('should throw an error if the parser is not available', (done) => {
        ReactDOM.render(<VisualStyleEditor
            format="unknow"
            code="unknow style format"
            onError={(error) => {
                try {
                    expect(error).toEqual({ messageId: 'styleeditor.formatNotSupported' });
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const ruleEditorNode = document.querySelector('.ms-style-rules-editor');
        expect(ruleEditorNode).toBeTruthy();
    });
});
