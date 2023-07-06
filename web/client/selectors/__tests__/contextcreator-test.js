/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    newContextSelector,
    creationStepSelector,
    selectedThemeSelector,
    customVariablesEnabledSelector,
    isNewContext,
    prefetchedDataSelector,
    disableImportSelector
} from '../contextcreator';

const testState = {
    contextcreator: {
        newContext: {
            name: 'name'
        },
        stepId: 'step',
        customVariablesEnabled: true,
        contextId: 'new'
    }
};

describe('contextcreator selectors', () => {
    it('newContextSelector', () => {
        expect(newContextSelector(testState)).toEqual({
            name: 'name'
        });
    });
    it('creationStepSelector', () => {
        expect(creationStepSelector(testState)).toBe('step');
    });
    it('customVariablesEnabledSelector', () => {
        expect(customVariablesEnabledSelector(testState)).toBe(true);
    });
    it('selectedThemeSelector', () => {
        const themeDark = {
            id: 'dark',
            label: 'Dark',
            type: 'link',
            href: 'dist/themes/dark.css'
        };
        expect(selectedThemeSelector(testState)).toBeFalsy();
        expect(selectedThemeSelector({
            ...testState,
            contextcreator: {
                ...testState.contextcreator,
                selectedTheme: themeDark
            }
        })).toEqual(themeDark);
    });
    it('isNewContext', () => {
        expect(isNewContext(testState)).toBe(true);
    });
    it('prefetchedDataSelector', () => {
        const prefetchedData = {resource: {name: "test"}};
        expect(prefetchedDataSelector({
            contextcreator: {
                prefetchedData
            }
        })).toEqual(prefetchedData);
    });
    it('disableImportSelector', () => {
        expect(disableImportSelector({
            contextcreator: {
                stepId: "general-settings"
            }
        })).toBeFalsy();
        expect(disableImportSelector({
            contextcreator: {
                stepId: "configure-map"
            }
        })).toBeTruthy();
    });
});
