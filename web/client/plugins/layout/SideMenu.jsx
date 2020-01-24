/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import head from 'lodash/head';
import isObject from 'lodash/isObject';
import isNumber from 'lodash/isNumber';
import Menu from '../../components/layout/Menu';
import BorderLayout from '../../components/layout/BorderLayout';

const SideMenu = forwardRef(({
    items = [],
    activePlugins = [],
    tabsProps = () => ({}),
    className = '',
    style = {},
    overlay = false,
    onSelect = () => {},
    menuId = '',
    resizeHandle = "e",
    resizeHandleAxis = "x",
    resizeDisabled = false,
    containerWidth,
    containerHeight,
    mirror = false,
    direction = 'vertical',
    tabsAlignment,
    calculateMaxAvailableSize,
    calculateAvailableContainerSize,
    size,
    onResizePanel = () => {},
    panelSizes,
    iconComponent,
    initialStepIndex,
    steps,
    maxDragThreshold,
    connectDragSize,
    tabsOrder
}, ref) => {
    const sortedItems = tabsOrder
        ? [...(items || [])].sort((a, b) => tabsOrder.indexOf(a.name) - tabsOrder.indexOf(b.name))
        : [...(items || [])].sort((a, b) => a.position > b.position ? 1 : -1);

    const itemNames = sortedItems.map(({ name }) => name);

    const selectedName = activePlugins && activePlugins
        .filter((activePlugin) => itemNames.indexOf(activePlugin) !== -1)[0] || '';

    const plugin = head(sortedItems
        .filter(( {name}) => name === selectedName)) || {};

    const tabs = sortedItems
        .map(({glyph, name, tooltipId, alertIconComponent }) => ({
            id: name,
            name,
            glyph,
            active: selectedName === name,
            alertIcon: alertIconComponent,
            iconComponent,
            ...tabsProps({name, tooltipId})
        }));

    const availableItems = sortedItems
        .filter(({ alwaysRendered, name }) => alwaysRendered || name === selectedName)
        .map(({ name, Component }) => {
            const panelSize = panelSizes && panelSizes[menuId] && panelSizes[menuId][name]
                || panelSizes && panelSizes[menuId]
                || {};
            const initialIndex = isObject(initialStepIndex) && initialStepIndex[name]
                || isNumber(initialStepIndex) && initialStepIndex;
            return (
                <div
                    key={name}
                    style={name !== selectedName ? { display: 'none' } : { position: 'relative', width: '100%', height: '100%' }}>
                    {Component && <Component
                        active={name === selectedName}
                        layoutPanelProps={{
                            name,
                            resizeHandle,
                            resizeHandleAxis,
                            containerWidth: panelSize.width || containerWidth,
                            containerHeight: panelSize.height || containerHeight,
                            resizeDisabled,
                            calculateMaxAvailableSize,
                            calculateAvailableContainerSize,
                            activePlugins,
                            size,
                            defaultStepIndex: panelSize.stepIndex || initialIndex,
                            steps,
                            maxDragThreshold,
                            onResize: data => onResizePanel(connectDragSize ? menuId : name, data),
                            onClose: () => onSelect(name, false)
                        }}
                    />}
                </div>
            );
        });

    const closedClass = availableItems && availableItems.length === 0 ? ' ms-menu-closed' : '';
    return (
        <div
            ref={ref}
            className={className}
            style={style}>
            <BorderLayout
                className={`ms-menu-layout${closedClass}`}>
                <Menu
                    tabs={tabs}
                    overlay={overlay}
                    tabsAlignment={tabsAlignment}
                    onSelect={name => onSelect(name)}
                    contentStyle={{
                        width: plugin.size && plugin.size !== 'auto' && containerWidth && plugin.size > containerWidth && containerWidth || plugin.size || 0
                    }}
                    mirror={mirror}
                    direction={direction}>
                    {availableItems}
                </Menu>
            </BorderLayout>
        </div>
    );
});

SideMenu.propTypes = {
    items: PropTypes.array,
    activePlugins: PropTypes.array,
    tabsProps: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    overlay: PropTypes.bool,
    onSelect: PropTypes.func,
    menuId: PropTypes.string,
    resizeHandle: PropTypes.string,
    resizeHandleAxis: PropTypes.string,
    resizeDisabled: PropTypes.bool,
    containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    mirror: PropTypes.bool,
    direction: PropTypes.string,
    tabsAlignment: PropTypes.string,
    calculateMaxAvailableSize: PropTypes.func,
    calculateAvailableContainerSize: PropTypes.func,
    size: PropTypes.array,
    onResizePanel: PropTypes.func,
    panelSizes: PropTypes.object,
    iconComponent: PropTypes.func,
    steps: PropTypes.array,
    maxDragThreshold: PropTypes.number,
    initialStepIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    connectDragSize: PropTypes.bool,
    tabsOrder: PropTypes.array
};

SideMenu.defaultProps = {
    activePlugins: [],
    tabsProps: () => ({}),
    className: '',
    style: {},
    overlay: false,
    onSelect: () => {},
    menuId: '',
    resizeHandle: "e",
    resizeHandleAxis: "x",
    resizeDisabled: false,
    mirror: false,
    direction: 'vertical',
    onResizePanel: () => {}
};

export default SideMenu;
