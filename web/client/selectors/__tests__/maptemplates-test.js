/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {desktopMapTemplatesConfigSelector} from '../maptemplates';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';
import localConfig from '../../reducers/localConfig';
import {
    localConfigLoaded
} from '../../actions/localConfig';

const stateMocker = createStateMocker({localConfig});
const mapTemplateDefinition = {
    name: "MapTemplates",
    cfg: {
        templates: [{ id: 1 }]
    }
};
const TEST_CONFIG = {
    test: "CONFIG",
    plugins: {
        desktop: [mapTemplateDefinition]
    }
};

describe('maptemplates selectors', () => {
    it('desktopMapTemplatesConfigSelector', () => {
        expect(desktopMapTemplatesConfigSelector(stateMocker(localConfigLoaded(TEST_CONFIG)))).toBe(mapTemplateDefinition);
    });
});
