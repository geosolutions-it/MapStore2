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
 * @name ResponsivePanel
 * @param props
 * @returns {JSX.Element}
 */
export default (props) => {
    const {
        dock = true,
        containerStyle,
        containerClassName,
        containerId,
        size,
        children,
        siblings,
        ...panelProps
    } = props;
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
