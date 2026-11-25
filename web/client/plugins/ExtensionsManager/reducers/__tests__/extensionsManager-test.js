/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import extensionsManager from '../extensionsManager';
import { showResult } from '../../actions/extensionsManager';
import { resultSelector } from '../../selectors/extensionsManager';

describe('extensionsManager reducer', () => {
    it('stores and hides the result of an action', () => {
        const shown = extensionsManager(undefined, showResult({ msgId: 'extensionsManager.installedMessage' }));
        expect(shown).toEqual({ result: { msgId: 'extensionsManager.installedMessage' } });
        expect(resultSelector({ extensionsManager: shown })).toEqual({ msgId: 'extensionsManager.installedMessage' });
        const hidden = extensionsManager(shown, showResult(null));
        expect(resultSelector({ extensionsManager: hidden })).toBe(null);
    });
    it('ignores other actions and has no result without state', () => {
        expect(extensionsManager({ result: { msgId: 'a' } }, { type: 'OTHER' })).toEqual({ result: { msgId: 'a' } });
        expect(resultSelector({})).toBe(null);
    });
});
