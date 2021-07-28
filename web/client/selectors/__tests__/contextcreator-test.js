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
    selectedThemeSelector
} from '../contextcreator';

const testState = {
    contextcreator: {
        newContext: {
            name: 'name'
        },
        stepId: 'step'
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
});
