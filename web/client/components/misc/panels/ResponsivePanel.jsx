/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DockContainer from "./DockContainer";
import ContainerDimensions from "react-container-dimensions";
import DockablePanel from "./DockablePanel";
import React from "react";

/**
 * Component for rendering DockPanel that supposed to:
 * - Get dynamic width if panel cannot fit to the screen width. It will be automatically resized to the window width.
 * - Get proper offsets based on the current map layout: with or without sidebar
 * @memberof components.misc.panels
 * @name ResponsivePanel
 * @param {boolean} dock - rendered as a dock if true, otherwise rendered as a modal window
 * @param {object} containerStyle - style object to be applied to the DockContainer.
 * @param {string} containerClassName - class name to be applied to the DockContainer.
 * @param {string} containerId - id to be applied to the DockContainer.
 * @param {number} size - maximum width of the dock panel.
 * @param {JSX.Element} children - components to be rendered inside the dock panel.
 * @param {JSX.Element} siblings - components to be rendered inside container after dock panel.
 * @param {object} panelProps - props that will be applied to the DockablePanel component.
 * @returns {JSX.Element}
 */
export default ({
    children,
    containerClassName,
    containerId,
    containerStyle,
    dock = true,
    siblings,
    size,
    ...panelProps}) => {
    return (
        <DockContainer
            dockStyle={containerStyle}
            id={containerId}
            className={containerClassName}
        >
            <ContainerDimensions>
                {({ width }) => (
                    <>
                        <DockablePanel
                            dock={dock}
                            size={size / width > 1 ? width : size}
                            {...panelProps}
                        >
                            { children }
                        </DockablePanel>
                        { siblings }
                    </>
                )}
            </ContainerDimensions>
        </DockContainer>
    );
};
