/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

import GeoNodeAdvancedSettings from '../GeoNodeAdvancedSettings';
import { getConfigProp, removeConfigProp, setConfigProp } from '../../../../../utils/ConfigUtils';

describe('Test GeoNode advanced settings', () => {
    let originalInitialState;

    beforeEach((done) => {
        originalInitialState = getConfigProp('initialState');
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        if (originalInitialState === undefined) {
            removeConfigProp('initialState');
        } else {
            setConfigProp('initialState', originalInitialState);
        }
        setTimeout(done);
    });

    it('renders the additional tag filter type selector with category as default', () => {
        ReactDOM.render(
            <GeoNodeAdvancedSettings service={{ type: 'geonode' }} />,
            document.getElementById('container')
        );

        const fields = document.querySelectorAll('.form-group');
        expect(fields.length).toBe(3);
        expect(fields[2].textContent).toContain('catalog.tagFilterType.label');

        const selectedValue = fields[2].querySelector('.Select-value-label');
        expect(selectedValue).toExist();
        expect(selectedValue.textContent).toBe('catalog.tagFilterType.category');
    });

    it('uses localConfig default when service tagFilterType is not set', () => {
        setConfigProp('initialState', {
            defaultState: {
                catalog: {
                    'default': {
                        tagFilterType: 'keyword'
                    }
                }
            }
        });

        ReactDOM.render(
            <GeoNodeAdvancedSettings service={{ type: 'geonode' }} />,
            document.getElementById('container')
        );

        const selectedValue = document.querySelector('.Select-value-label');
        expect(selectedValue).toExist();
        expect(selectedValue.textContent).toBe('catalog.tagFilterType.keyword');
    });

    it('prefers the service tagFilterType over the localConfig default', () => {
        setConfigProp('initialState', {
            defaultState: {
                catalog: {
                    'default': {
                        tagFilterType: 'keyword'
                    }
                }
            }
        });

        ReactDOM.render(
            <GeoNodeAdvancedSettings service={{ type: 'geonode', tagFilterType: 'category' }} />,
            document.getElementById('container')
        );

        const selectedValue = document.querySelector('.Select-value-label');
        expect(selectedValue).toExist();
        expect(selectedValue.textContent).toBe('catalog.tagFilterType.category');
    });

    it('calls onChangeServiceProperty when tag filter type changes', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');

        ReactDOM.render(
            <GeoNodeAdvancedSettings
                service={{ type: 'geonode', tagFilterType: 'category' }}
                onChangeServiceProperty={action.onChangeServiceProperty}
            />,
            document.getElementById('container')
        );

        const tagFilterInput = document.querySelector('input[role="combobox"]');
        expect(tagFilterInput).toBeTruthy();

        TestUtils.Simulate.change(tagFilterInput, { target: { value: 'keyword' } });
        TestUtils.Simulate.keyDown(tagFilterInput, { keyCode: 9, key: 'Tab' });

        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual(['tagFilterType', 'keyword']);
    });
});
