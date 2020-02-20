/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import FlexibleLayoutPanel from './FlexibleLayoutPanel';

/**
 * HOC to add draggable functionality to panel of layout
 */
const withFlexibleLayoutPanel = (
    Component,
    {
        defaultWidth = 400,
        defaultHeight = 200
    } = {}) => {
    return ({
        flexibleLayoutPanelProps,
        ...props
    }) => {
        if (!flexibleLayoutPanelProps) {
            return <Component { ...props } />;
        }
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
            defaultStepIndex,
            steps,
            onClose,
            maxDragThreshold
        } = flexibleLayoutPanelProps;
        return (
            <FlexibleLayoutPanel
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
                defaultStepIndex={defaultStepIndex}
                steps={steps}
                onClose={onClose}
                maxDragThreshold={maxDragThreshold}
                firstRender={!!(containerWidth === undefined
                    || containerHeight === undefined)}>
                <Component { ...props } />
            </FlexibleLayoutPanel>
        );
    };
};

export default withFlexibleLayoutPanel;
