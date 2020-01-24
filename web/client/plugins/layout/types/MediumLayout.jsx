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

const MediumLayout = forwardRef(({
    bodyItems = [],
    backgroundItems = [],
    centerItems = [],
    leftMenuItems = [],
    rightMenuItems = [],
    columnItems = [],
    bottomItems = [],
    headerItems = [],
    footerItems = [],
    dragMargin = [8, 8],
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
    initialStepIndex,
    steps,
    maxDragThreshold,
    connectDragSize,
    tabsOrder
}, ref) => {

    const backgroundRef = useRef();
    const layoutBodyRef = useRef();

    if (!isFunction(ref) && !isNil(ref)) {
        ref.current = {
            bodyNode: layoutBodyRef,
            backgroundNode: backgroundRef
        };
    }

    const sideMenuItems = [ ...leftMenuItems, ...rightMenuItems ];
    useEffect(() => {
        const layoutStructure = {
            [LEFT_MENU_ID]: sideMenuItems.map(({ name }) => name)
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

    function calculateAvailableContainerSize() {
        return [
            width - 56,
            height
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

    const backgroundStyle = sideMenuItems.length === 0 ? {
        left: 0
    } : {};

    return (
        <BorderLayout
            className="ms-layout ms-md"
            header={headerItems.map(({ Component }, key) => Component && <Component key={key}/>)}
            footer={footerItems.map(({ Component }, key) => Component && <Component key={key}/>)}
            columns={[
                <div
                    ref={backgroundRef}
                    key="background"
                    className="ms-layout-background"
                    style={backgroundStyle}>
                    {backgroundItems.map(({ Component }, key) => Component && <Component key={key}/>)}
                </div>,
                sideMenuItems.length > 0 ? <SideMenu
                    overlay
                    menuId={LEFT_MENU_ID}
                    key={LEFT_MENU_ID}
                    resizeHandle="e"
                    resizeHandleAxis="x"
                    calculateMaxAvailableSize={calculateMaxAvailableSize}
                    calculateAvailableContainerSize={calculateAvailableContainerSize}
                    size={[width, height]}
                    resizeDisabled={resizeDisabled}
                    style={{
                        zIndex: 2,
                        order: -1,
                        pointerEvents: 'none'
                    }}
                    tabsProps={({ tooltipId }) => ({
                        btnProps: {
                            tooltipId,
                            tooltipPosition: 'right'
                        }
                    })}
                    containerHeight="100%"
                    activePlugins={activePlugins}
                    onSelect={onSelect}
                    items={sideMenuItems}
                    iconComponent={iconComponent}
                    onResizePanel={onResizePanel}
                    panelSizes={panelSizes}
                    initialStepIndex={initialStepIndex}
                    steps={steps}
                    maxDragThreshold={maxDragThreshold}
                    connectDragSize={connectDragSize}
                    tabsOrder={tabsOrder}/> : null,
                ...columnItems.map(({ Component }, key) => Component && <Component key={key}/>)
            ]}>
            <div
                className="ms-layout-body-container">
                <div
                    id="ms-layout-body"
                    ref={layoutBodyRef}
                    className="ms-layout-body"
                    data-ms-size="md">
                    {isContentVisible && bodyItems.map(({ Component }, key) => Component && <Component key={key}/>) }
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

MediumLayout.propTypes = {
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

MediumLayout.defaultProps = {
    bodyItems: [],
    backgroundItems: [],
    centerItems: [],
    leftMenuItems: [],
    rightMenuItems: [],
    columnItems: [],
    bottomItems: [],
    headerItems: [],
    footerItems: [],
    dragMargin: [8, 8],
    minLayoutBodySize: [256, 256],
    onUpdateStructure: () => {},
    onSelect: () => {},
    onResizePanel: () => {},
    resizeDisabled: false
};

export default MediumLayout;
