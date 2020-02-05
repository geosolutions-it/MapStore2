/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import find from 'lodash/find';

export const updatePanelSizes = ({
    panelSizes,
    layoutStructure,
    name,
    data
}) => {
    const layoutSectionKey = find(
        Object.keys(layoutStructure),
        key => find(layoutStructure[key], pluginName => pluginName === name)
    );
    return layoutSectionKey === undefined
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
        };
};

export const updateActivePlugins = ({
    activePlugins,
    layoutStructure,
    name,
    enable
}) => {
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
    return [
        ...(isActive
            ? []
            : [name]),
        ...filteredActivePlugins
    ];
};
