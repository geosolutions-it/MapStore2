/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import MarkSelector from '../MarkSelector';
import { Simulate } from 'react-dom/test-utils';
import expect from 'expect';

describe('MarkSelector component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<MarkSelector />, document.getElementById("container"));
        const markSelectorNode = document.querySelector('.ms-mark-preview');
        expect(markSelectorNode).toBeTruthy();
    });

    it('should display default list of symbols', (done) => {
        ReactDOM.render(<MarkSelector onChange={(value) => {
            expect(value).toBe('Circle');
            done();
        }}/>, document.getElementById("container"));
        const markSelectorNode = document.querySelector('.ms-mark-preview');
        expect(markSelectorNode).toBeTruthy();
        Simulate.click(markSelectorNode);
        const markSelectorListNode = document.querySelector('.ms-mark-list');
        expect(markSelectorListNode).toBeTruthy();
        const markSelectorListButtonsNodes = [...document.querySelectorAll('.ms-mark-list button')];
        expect(markSelectorListButtonsNodes.length).toBe(15);
        Simulate.click(markSelectorListButtonsNodes[0]);
    });
    it('should display extended list of symbols', (done) => {
        ReactDOM.render(<MarkSelector
            svgSymbolsPath="base/web/client/test-resources/symbols/index.json"
            onUpdateOptions={(options) => {
                try {
                    expect(options.length).toBe(16);
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById("container"));
        const markSelectorNode = document.querySelector('.ms-mark-preview');
        expect(markSelectorNode).toBeTruthy();
    });
});
