/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { Controls } from '../../utils/DashboardUtils';

import {
    controlSelectorCreator,
    deleteDialogSelector
} from '../dashboards';

describe('dashboards selectors', () => {
    it('controlSelectorCreator returns the value of the given control', () => {
        const state = {dashboards: { controls: { 'delete': { show: true }}}};
        expect(controlSelectorCreator(Controls.SHOW_DELETE)(state)).toBe(true);
    });
    it('deleteDialogSelector returns the value of the show attribute on the delete control', () => {
        const state = {dashboards: { controls: { 'delete': { show: false }}}};
        expect(deleteDialogSelector(state)).toBe(false);
    });
});
