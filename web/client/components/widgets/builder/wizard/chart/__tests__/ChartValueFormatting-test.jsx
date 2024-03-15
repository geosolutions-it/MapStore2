/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ChartValueFormatting from '../ChartValueFormatting';
import { Simulate, act } from 'react-dom/test-utils';

describe('ChartValueFormatting', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<ChartValueFormatting />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.prefix',
            'widgets.advanced.format ',
            'widgets.advanced.suffix',
            'widgets.advanced.formula '
        ]);
    });
    it('should not render formula field with hideFormula', () => {
        ReactDOM.render(<ChartValueFormatting hideFormula />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.prefix',
            'widgets.advanced.format ',
            'widgets.advanced.suffix'
        ]);
    });
    it('should render title', () => {
        ReactDOM.render(<ChartValueFormatting title={'Value formatting'} />, document.getElementById('container'));
        const separatorNode = document.querySelector('.ms-wizard-form-separator');
        expect(separatorNode.innerText).toBe('Value formatting');
    });
    it('should trigger on change', (done) => {
        act(() => {
            ReactDOM.render(<ChartValueFormatting
                options={{
                    tickPrefix: ''
                }}
                onChange={(key, value) => {
                    try {
                        expect(key).toBe('tickPrefix');
                        expect(value).toBe('~');
                    } catch (e) {
                        done(e);
                    }
                    done();
                }} />, document.getElementById('container'));
        });
        const inputNode = document.querySelector('.form-control');
        expect(inputNode).toBeTruthy();
        Simulate.focus(inputNode);
        Simulate.change(inputNode, { target: { value: '~' } });
    });
});
