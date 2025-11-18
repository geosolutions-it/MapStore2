/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import maptemplates from '../maptemplates';
import { configureMap } from '../../actions/config';

describe('mapTemplates reducer', () => {
    it('Do not replace templates if "configureMap" action has no mapTemplates as config', () => {
        const initialState = {
            templates: [{ id: 'template-1', name: 'Template 1' }]
        };
        const state = maptemplates(initialState, configureMap({ }));
        expect(state.templates).toEqual(initialState.templates);
    });
    it('Do not replace templates if "configureMap" action has empty array of mapTemplates as config', () => {
        const initialState = {
            templates: [{ id: 'template-1', name: 'Template 1' }]
        };
        const state = maptemplates(initialState, configureMap({ }));
        expect(state.templates).toEqual(initialState.templates);
    });
    it('Replace templates when "configureMap" action has provided some mapTemplates as config', () => {
        const initialState = {
            templates: [{ id: 'template-1' }]
        };
        const toUpdateTemplates = [{id: 'updated-template'}];
        const state = maptemplates(initialState, configureMap({ mapTemplates: toUpdateTemplates }));
        expect(state.templates).toBe(toUpdateTemplates);
    });
});
