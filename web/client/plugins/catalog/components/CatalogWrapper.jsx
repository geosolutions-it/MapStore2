/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../components/layout/FlexBox'


const CatalogWrapper = ({
    isPanel,
    active,
    dockStyle = {},
    children
}) => {
    const className = isPanel 
        ? 'ms-layer-catalog-wrapper_panel' 
        : 'ms-layer-catalog-wrapper';
    
    const style = isPanel 
        ? { 
            ...dockStyle, 
            display: active ? 'block' : 'none' 
        } 
        : {};

    return (
        <div className={className} style={style}>
            <FlexBox column classNames={["_relative", "_fill"]}>
                {children}
            </FlexBox>
        </div>
    );
};

export default CatalogWrapper;
