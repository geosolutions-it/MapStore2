/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { extractGeometryAttributeName, extractGeometryType } from '../WFSLayerUtils';
import describePois from '../../test-resources/wfs/describe-pois.json';
import expect from 'expect';

describe("WFSLayerUtils", () => {
    it('extractGeometryAttributeName', () => {
        expect(extractGeometryAttributeName(describePois)).toBe("the_geom");
    });
    it('extractGeometryType', () => {
        expect(extractGeometryType(describePois)).toBe("Point");
    });
});
