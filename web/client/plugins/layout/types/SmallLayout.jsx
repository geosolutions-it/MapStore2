/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import isNumber from 'lodash/isNumber';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';
import BorderLayout from '../../../components/layout/BorderLayout';
import SideMenu from '../SideMenu';

const SmallLayout = forwardRef(({
    bodyItems = [],
    backgroundItems = [],
    centerItems = [],
    leftMenuItems = [],
    rightMenuItems = [],
    columnItems = [],
    bottomItems = [],
    headerItems = [],
    footerItems = [],
    dragMargin = [0, 0],
    minLayoutBodySize = [800, 600],
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
    maxDragThreshold
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
            bottomMenuItems: sideMenuItems.map(({ name }) => name)
        };
        onUpdateStructure(layoutStructure);
    }, []);

    function calculateMaxAvailableSize(size) {
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
            width,
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
        bottom: 0
    } : {};

    return (
        <BorderLayout
            className="ms-layout ms-sm"
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
                ...columnItems.map(({ Component }, key) => Component && <Component key={key}/>)
            ]}>
            <div
                className="ms-layout-body-container">
                <div
                    ref={layoutBodyRef}
                    id="ms-layout-body"
                    className="ms-layout-body"
                    data-ms-size="sm">
                    {isContentVisible && bodyItems.map(({ Component }, key) => Component && <Component key={key}/>)}
                    <div className="ms-layout-center">
                        {isContentVisible && centerItems.map(({ Component }, key) => Component && <Component key={key}/>)}
                    </div>
                </div>
                <div
                    className="ms-layout-bottom">
                    {sideMenuItems.length > 0 ? <SideMenu
                        menuId="bottom-menu"
                        key="bottom-menu"
                        resizeHandle="n"
                        resizeHandleAxis="y"
                        direction="horizontal"
                        tabsAlignment="justify"
                        calculateMaxAvailableSize={calculateMaxAvailableSize}
                        calculateAvailableContainerSize={calculateAvailableContainerSize}
                        size={[width, height]}
                        style={{ pointerEvents: 'none' }}
                        tabsProps={({ tooltipId }) => ({
                            btnProps: {
                                tooltipId,
                                tooltipPosition: 'top'
                            }
                        })}
                        activePlugins={activePlugins}
                        onSelect={onSelect}
                        containerWidth="100%"
                        items={sideMenuItems}
                        iconComponent={iconComponent}
                        onResizePanel={onResizePanel}
                        panelSizes={panelSizes}
                        resizeDisabled={resizeDisabled}
                        initialStepIndex={initialStepIndex}
                        steps={steps}
                        maxDragThreshold={maxDragThreshold}/> : null}
                    {bottomItems.map(({ Component }, key) => Component && <Component key={key}/>)}
                </div>
            </div>
        </BorderLayout>
    );
});

SmallLayout.propTypes = {
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
    initialStepIndex: PropTypes.number
};

SmallLayout.defaultProps = {
    bodyItems: [],
    backgroundItems: [],
    centerItems: [],
    leftMenuItems: [],
    rightMenuItems: [],
    columnItems: [],
    bottomItems: [],
    headerItems: [],
    footerItems: [],
    dragMargin: [0, 0],
    minLayoutBodySize: [800, 600],
    onUpdateStructure: () => {},
    onSelect: () => {},
    onResizePanel: () => {},
    resizeDisabled: false
};

export default SmallLayout;
