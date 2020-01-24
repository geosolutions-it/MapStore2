/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useEffect, useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import isNumber from 'lodash/isNumber';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';
import BorderLayout from '../../../components/layout/BorderLayout';
import SideMenu from '../SideMenu';

const LEFT_MENU_ID = 'left-menu';
const RIGHT_MENU_ID = 'right-menu';

const LargeLayout = forwardRef(({
    bodyItems = [],
    backgroundItems = [],
    centerItems = [],
    leftMenuItems = [],
    rightMenuItems = [],
    columnItems = [],
    bottomItems = [],
    headerItems = [],
    footerItems = [],
    dragMargin = [256, 256],
    minLayoutBodySize = [256, 256],
    onUpdateStructure = () => {},
    iconComponent,
    activePlugins,
    width,
    height,
    panelSizes,
    onSelect = () => {},
    onResizePanel = () => {},
    resizeDisabled,
    steps,
    maxDragThreshold,
    initialStepIndex,
    connectDragSize,
    tabsOrder
}, ref) => {

    const backgroundRef = useRef();
    const layoutBodyRef = useRef();
    const leftMenuRef = useRef();
    const rightMenuRef = useRef();

    if (!isFunction(ref) && !isNil(ref)) {
        ref.current = {
            bodyNode: layoutBodyRef,
            backgroundNode: backgroundRef
        };
    }

    useEffect(() => {
        const layoutStructure = {
            [LEFT_MENU_ID]: leftMenuItems.map(({ name }) => name),
            [RIGHT_MENU_ID]: rightMenuItems.map(({ name }) => name)
        };
        onUpdateStructure(layoutStructure);
    }, []);

    function calculateMaxAvailableSize(size = {}) {
        if (!(layoutBodyRef && layoutBodyRef.current)) {
            return [
                undefined,
                undefined
            ];
        }
        const { width: layoutWidth, height: layoutHeight } = layoutBodyRef.current.getBoundingClientRect();
        const maxWidth = isNumber(size.width) && size.width + layoutWidth - dragMargin[0] || undefined;
        const maxHeight = isNumber(size.height) && size.height + layoutHeight - dragMargin[1] || undefined;
        return [
            maxWidth,
            maxHeight
        ];
    }

    function calculateAvailableContainerSize(panelRef) {
        const panelSize = panelRef && panelRef.current && panelRef.current.getBoundingClientRect();
        const { width: panelWidth = 0, height: panelHeight = 0 } = panelSize || {};
        const containerWidth = width - panelWidth;
        const containerHeight = height - panelHeight;
        return [
            containerWidth,
            containerHeight
        ];
    }

    function isLayoutBodyVisible() {
        if (!(layoutBodyRef && layoutBodyRef.current)) {
            return false;
        }
        const { width: layoutWidth, height: layoutHeight } = layoutBodyRef.current.getBoundingClientRect();
        return layoutWidth > minLayoutBodySize[0] && layoutHeight > minLayoutBodySize[1];
    }
    const [isContentVisible, setContentVisibility] = useState(isLayoutBodyVisible());
    const panelSizesStr = panelSizes && JSON.stringify(panelSizes);

    useEffect(() => {
        const isVisible = isLayoutBodyVisible();
        setContentVisibility(isVisible);
    }, [ panelSizesStr ]);


    const backgroundLeftStyle = leftMenuItems.length === 0 ? { left: 0 } : {};
    const backgroundRightStyle = rightMenuItems.length === 0 ? { right: 0 } : {};

    return (
        <BorderLayout
            className="ms-layout ms-lg"
            header={headerItems.map(({ Component }, key) => Component && <Component key={key}/>)}
            footer={footerItems.map(({ Component }, key) => Component && <Component key={key}/>)}
            columns={[
                <div
                    ref={backgroundRef}
                    key="background"
                    className="ms-layout-background"
                    style={{
                        ...backgroundLeftStyle,
                        ...backgroundRightStyle
                    }}>
                    {backgroundItems.map(({ Component }, key) => Component && <Component key={key}/>)}
                </div>,
                leftMenuItems.length > 0 ? <SideMenu
                    ref={leftMenuRef}
                    key={LEFT_MENU_ID}
                    menuId={LEFT_MENU_ID}
                    items={leftMenuItems}
                    activePlugins={activePlugins}
                    tabsProps={({ tooltipId }) => ({
                        btnProps: {
                            tooltipId,
                            tooltipPosition: 'right'
                        }
                    })}
                    style={{
                        zIndex: 2,
                        order: -1,
                        pointerEvents: 'none'
                    }}
                    overlay
                    onSelect={onSelect}
                    resizeHandle="e"
                    resizeHandleAxis="x"
                    resizeDisabled={resizeDisabled}
                    containerHeight="100%"
                    calculateMaxAvailableSize={calculateMaxAvailableSize}
                    calculateAvailableContainerSize={calculateAvailableContainerSize.bind(null, rightMenuRef)}
                    size={[width, height]}
                    iconComponent={iconComponent}
                    onResizePanel={onResizePanel}
                    initialStepIndex={initialStepIndex}
                    steps={steps}
                    maxDragThreshold={maxDragThreshold}
                    panelSizes={panelSizes}
                    connectDragSize={connectDragSize}
                    tabsOrder={tabsOrder}/> : null,
                rightMenuItems.length > 0 ? <SideMenu
                    ref={rightMenuRef}
                    key={RIGHT_MENU_ID}
                    menuId={RIGHT_MENU_ID}
                    mirror
                    overlay
                    resizeHandle="w"
                    resizeHandleAxis="x"
                    calculateMaxAvailableSize={calculateMaxAvailableSize}
                    calculateAvailableContainerSize={calculateAvailableContainerSize.bind(null, leftMenuRef)}
                    size={[width, height]}
                    resizeDisabled={resizeDisabled}
                    style={{
                        zIndex: 2,
                        pointerEvents: 'none'
                    }}
                    tabsProps={({ tooltipId }) => ({
                        btnProps: {
                            tooltipId,
                            tooltipPosition: 'left'
                        }
                    })}
                    containerHeight="100%"
                    activePlugins={activePlugins}
                    onSelect={onSelect}
                    items={rightMenuItems}
                    iconComponent={iconComponent}
                    onResizePanel={onResizePanel}
                    initialStepIndex={initialStepIndex}
                    steps={steps}
                    maxDragThreshold={maxDragThreshold}
                    panelSizes={panelSizes}
                    connectDragSize={connectDragSize}
                    tabsOrder={tabsOrder}/> : null,
                ...columnItems.map(({ Component }, key) => Component && <Component key={key}/>)
            ]}>
            <div
                className="ms-layout-body-container">
                <div
                    ref={layoutBodyRef}
                    id="ms-layout-body"
                    className="ms-layout-body"
                    data-ms-size="lg">
                    {isContentVisible && bodyItems.map(({ Component }, key) => Component && <Component key={key}/>)}
                    <div className="ms-layout-center">
                        {isContentVisible && centerItems.map(({ Component }, key) => Component && <Component key={key}/>)}
                    </div>
                </div>
                <div
                    className="ms-layout-bottom">
                    {bottomItems.map(({ Component }, key) => Component && <Component key={key}/>)}
                </div>
            </div>
        </BorderLayout>
    );
});

LargeLayout.propTypes = {
    bodyItems: PropTypes.array,
    backgroundItems: PropTypes.array,
    centerItems: PropTypes.array,
    leftMenuItems: PropTypes.array,
    rightMenuItems: PropTypes.array,
    columnItems: PropTypes.array,
    bottomItems: PropTypes.array,
    headerItems: PropTypes.array,
    footerItems: PropTypes.array,
    dragMargin: PropTypes.array,
    minLayoutBodySize: PropTypes.array,
    onUpdateStructure: PropTypes.func,
    iconComponent: PropTypes.func,
    activePlugins: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    panelSizes: PropTypes.object,
    onSelect: PropTypes.func,
    onResizePanel: PropTypes.func,
    resizeDisabled: PropTypes.bool,
    steps: PropTypes.array,
    maxDragThreshold: PropTypes.number,
    initialStepIndex: PropTypes.number,
    connectDragSize: PropTypes.bool,
    tabsOrder: PropTypes.array
};

LargeLayout.defaultProps = {
    bodyItems: [],
    backgroundItems: [],
    centerItems: [],
    leftMenuItems: [],
    rightMenuItems: [],
    columnItems: [],
    bottomItems: [],
    headerItems: [],
    footerItems: [],
    dragMargin: [256, 256],
    minLayoutBodySize: [256, 256],
    onUpdateStructure: () => {},
    onSelect: () => {},
    onResizePanel: () => {},
    resizeDisabled: false
};

export default LargeLayout;
