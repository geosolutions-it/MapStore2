/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { setControlProperty } from './controls';
import get from 'lodash/get';
import find from 'lodash/find';

export const updateLayoutType = setControlProperty.bind(null, 'layout', 'type');

export const resizeLayoutPanel = (name, data) => {
    return (dispatch, getState) => {
        const state = getState();
        const panelSizes = get(state, 'controls.layout.panelSizes') || {};
        const layoutStructure = get(state, 'controls.layout.structure') || [];
        const layoutSectionKey = find(
            Object.keys(layoutStructure),
            key => find(layoutStructure[key], pluginName => pluginName === name)
        );
        dispatch(
            setControlProperty('layout', 'panelSizes',
                layoutSectionKey === undefined
                    ? {
                        ...panelSizes,
                        [name]: {
                            ...(panelSizes[name] || {}),
                            ...data
                        }
                    }
                    : {
                        ...panelSizes,
                        [layoutSectionKey]: {
                            ...(panelSizes[layoutSectionKey] || {}),
                            [name]: {
                                ...(panelSizes[layoutSectionKey] && panelSizes[layoutSectionKey][name] || {}),
                                ...data
                            }
                        }
                    }
            )
        );
    };
};

export const setActivePlugin = (name, enable) => {
    return (dispatch, getState) => {
        const state = getState();
        const activePlugins = get(state, 'controls.layout.activePlugins') || [];
        const layoutStructure = get(state, 'controls.layout.structure') || [];
        const layoutSectionKey = find(
            Object.keys(layoutStructure),
            key => find(layoutStructure[key], pluginName => pluginName === name)
        );
        const layoutSectionItemsName = layoutStructure[layoutSectionKey] || [];

        const isActive = enable === undefined
            ? !!find(activePlugins, (activePlugin) => activePlugin === name)
            : !enable;

        const filteredActivePlugins = activePlugins
            .filter(
                (activePlugin) => !find(layoutSectionItemsName, (pluginName) => pluginName === activePlugin)
            );

        const newActivePlugins = [
            ...(isActive
                ? []
                : [name]),
            ...filteredActivePlugins
        ];
        dispatch(setControlProperty('layout', 'activePlugins', newActivePlugins));
    };
};

export const updateLayoutStructure = setControlProperty.bind(null, 'layout', 'structure');
