/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import get from 'lodash/get';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import { createShallowSelectorCreator } from '../utils/ReselectUtils';

export const activePluginsSelector = createShallowSelectorCreator((a, b) => a === b)(
    state => get(state, 'controls.layout.activePlugins') || [],
    activePlugins => activePlugins
);

export const panelSizesSelector = createShallowSelectorCreator(
    (a, b) => {
        if (isObject(a) && isObject(b)) {
            const aStr = JSON.stringify(a);
            const bStr = JSON.stringify(b);
            return aStr === bStr;
        }
        return a === b
        || !isNil(a) && !isNil(b) && a.width === b.width && a.height === b.height;
    }
)(
    state => get(state, 'controls.layout.panelSizes') || {},
    panelSizes => panelSizes
);

export const layoutStructureSelector = createShallowSelectorCreator(
    (a, b) => {
        if (isObject(a) && isObject(b)) {
            const aStr = JSON.stringify(a);
            const bStr = JSON.stringify(b);
            return aStr === bStr;
        }
        return a === b || !isNil(a) && !isNil(b);
    }
)(
    state => get(state, 'controls.layout.structure') || {},
    layoutStructure => layoutStructure
);

export const layoutTypeSelector = state => get(state, 'controls.layout.type');
