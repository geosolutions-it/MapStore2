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
    it('IMAGE entity with no alignment', () => {
        const entity = {
            type: "IMAGE",
            data: {
                width: '128px',
                height: '128px',
                src: 'http://src',
                alt: 'alternative'
            }
        };

        const expectedResult = '<img src="http://src" alt="alternative" style="height: 128px; width: 128px; display: block; margin: 0 auto 0 auto;" />';
        const result = customEntityTransform(entity);

        expect(result).toBe(expectedResult);
    });
    it('IMAGE entity with alignment=none', () => {
        const entity = {
            type: "IMAGE",
            data: {
                width: '128px',
                height: '128px',
                src: 'http://src',
                alignment: 'none',
                alt: 'alternative'
            }
        };

        const expectedResult = '<img src="http://src" alt="alternative" style="height: 128px; width: 128px; display: block; margin: 0 auto 0 auto;" />';
        const result = customEntityTransform(entity);

        expect(result).toBe(expectedResult);
    });
    it('IMAGE entity with alignment=left', () => {
        const entity = {
            type: "IMAGE",
            data: {
                width: '128px',
                height: '128px',
                src: 'http://src',
                alignment: 'left',
                alt: 'alternative'
            }
        };

        const expectedResult = '<img src="http://src" alt="alternative" style="height: 128px; width: 128px; float: left;" />';
        const result = customEntityTransform(entity);

        expect(result).toBe(expectedResult);
    });
    it('IMAGE entity with alignment=right', () => {
        const entity = {
            type: "IMAGE",
            data: {
                width: '128px',
                height: '128px',
                src: 'http://src',
                alignment: 'right',
                alt: 'alternative'
            }
        };

        const expectedResult = '<img src="http://src" alt="alternative" style="height: 128px; width: 128px; float: right;" />';
        const result = customEntityTransform(entity);

        expect(result).toBe(expectedResult);
    });
});
