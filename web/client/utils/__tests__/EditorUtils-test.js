/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import { customEntityTransform } from '../EditorUtils';

describe('Test the EditorUtils', () => {
    it('should output geostory story internal story link', () => {
        const entity = {
            type: "LINK",
            data: {
                targetOption: '_self',
                attributes: {
                    'data-geostory-interaction-name': 'name',
                    'data-geostory-interaction-type': 'scrollTo',
                    'data-geostory-interaction-params': 'params'
                }
            }
        };
        const requiredLink = '<a data-geostory-interaction-name="name" data-geostory-interaction-type="scrollTo" data-geostory-interaction-params="params" onclick="__geostory_interaction(type=\'scrollTo\', \'params\')">test-link</a>';
        const geoStoryLink = customEntityTransform(entity, "test-link");
        expect(geoStoryLink).toEqual(requiredLink);
    });
});
