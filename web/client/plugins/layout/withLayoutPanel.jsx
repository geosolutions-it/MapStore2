/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import LayoutPanel from './LayoutPanel';

/**
 * HOC to add draggable functionality to panel of layout
 */
const withLayoutPanel = (
    Component,
    {
        defaultWidth = 400,
        defaultHeight = 200
    } = {}) => {
    return ({
        layoutPanelProps,
        ...props
    }) => {
        const {
            name,
            resizeDisabled,
            resizeHandle,
            resizeHandleAxis,
            containerWidth,
            containerHeight,
            calculateMaxAvailableSize,
            calculateAvailableContainerSize,
            activePlugins,
            size,
            onResize,
            initialStepIndex,
            steps,
            onClose,
            maxDragThreshold
        } = layoutPanelProps || {};
        return (
            <LayoutPanel
                active={props.active}
                name={name}
                activePlugins={activePlugins}
                resizeDisabled={resizeDisabled}
                resizeHandle={resizeHandle}
                axis={resizeHandleAxis}
                defaultWidth={containerWidth || defaultWidth}
                defaultHeight={containerHeight || defaultHeight}
                defaultMinConstraints={[defaultWidth, defaultHeight]}
                calculateMaxAvailableSize={calculateMaxAvailableSize}
                calculateAvailableContainerSize={calculateAvailableContainerSize}
                size={size}
                onResize={onResize}
                initialStepIndex={initialStepIndex}
                steps={steps}
                onClose={onClose}
                maxDragThreshold={maxDragThreshold}
                firstRender={!!(containerWidth === undefined
                    || containerHeight === undefined)}>
                <Component { ...props } />
            </LayoutPanel>
        );
    };
};

export default withLayoutPanel;
