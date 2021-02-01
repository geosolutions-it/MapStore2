/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import VisibilityLimitsForm from '../VisibilityLimitsForm';

describe('VisibilityLimitsForm', () => {
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
        ReactDOM.render(<VisibilityLimitsForm/>, document.getElementById('container'));
        expect(document.querySelector('.ms-visibility-limits-form')).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(4);
    });
    it('should render maxResolution and minResolution labels as scales', () => {
        const layer = {
            maxResolution: 1000,
            minResolution: 10
        };
        act(() => {
            ReactDOM.render(<VisibilityLimitsForm
                layer={layer}
            />, document.getElementById('container'));
        });
        expect(document.querySelector('.ms-visibility-limits-form')).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(4);
        const labels = document.querySelectorAll('.Select-value-label > span');
        expect([...labels].map(label => label.innerHTML)).toEqual([
            '1 : 3779528',
            '1 : 37795',
            'layerProperties.visibilityLimits.scale'
        ]);
    });
    it('should render maxResolution and minResolution labels as resolution', () => {
        const layer = {
            maxResolution: 1000,
            minResolution: 10
        };
        act(() => {
            ReactDOM.render(<VisibilityLimitsForm
                layer={layer}
                defaultLimitsType="resolution"
            />, document.getElementById('container'));
        });
        expect(document.querySelector('.ms-visibility-limits-form')).toBeTruthy();
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(4);
        const labels = document.querySelectorAll('.Select-value-label > span');
        expect([...labels].map(label => label.innerHTML)).toEqual([
            '1000',
            '10',
            'layerProperties.visibilityLimits.resolution'
        ]);
    });
    it('should disable the select input if disableResolutionLimits is true', () => {
        const layer = {
            disableResolutionLimits: true
        };
        act(() => {
            ReactDOM.render(<VisibilityLimitsForm
                layer={layer}
                defaultLimitsType="resolution"
            />, document.getElementById('container'));
        });
        expect(document.querySelector('.ms-visibility-limits-form')).toBeTruthy();
        const disabledInput = document.querySelectorAll('.is-disabled');
        expect(disabledInput.length).toBe(3);
    });
    it('should render wms get capabilities button if the layer type is wms', () => {
        const layer = {
            type: 'wms'
        };
        act(() => {
            ReactDOM.render(<VisibilityLimitsForm
                layer={layer}
            />, document.getElementById('container'));
        });
        expect(document.querySelector('.ms-visibility-limits-form')).toBeTruthy();
        const buttons = document.querySelectorAll('.square-button-md');
        expect(buttons.length).toBe(1);
    });
});
