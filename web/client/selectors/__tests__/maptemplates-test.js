/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {allTemplatesSelector} from '../maptemplates';

describe('maptemplates selectors', () => {
    it('should return allowed templates when they are provided', () => {
        const state = {
            maptemplates: {
                allowedTemplates: ["TEST"]
            },
            context: {
                currentContext: {
                    templates: ["CONTEXT TEST TEMPLATE"]
                }
            }
        };
        expect(allTemplatesSelector(state)[0]).toBe("TEST");
    });

    it('should fallback to templates in context if allowedTemplates is empty', () => {
        const state = {
            maptemplates: {
                allowedTemplates: []
            },
            context: {
                currentContext: {
                    templates: ["CONTEXT TEST TEMPLATE"]
                }
            }
        };
        expect(allTemplatesSelector(state)[0]).toBe("CONTEXT TEST TEMPLATE");
    });
});
