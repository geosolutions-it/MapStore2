/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Title from './Title';

const NodeHeader = ({
    node,
    filterText,
    currentLocale,
    tooltipOptions,
    beforeTitle,
    afterTitle,
    onClick,
    className,
    showTitleTooltip,
    showFullTitle
}) => {
    return (
        <>
            <div className={`ms-node-header${className ? ` ${className}` : ''}`} onClick={onClick}>
                <div className="ms-node-header-info">
                    <div className="ms-node-header-addons">
                        {beforeTitle}
                    </div>
                    <div className="ms-node-title-container">
                        <Title
                            node={node}
                            filterText={filterText}
                            currentLocale={currentLocale}
                            tooltipOptions={tooltipOptions}
                            showTooltip={showTitleTooltip}
                            showFullTitle={showFullTitle}
                        />
                    </div>
                    <div className="ms-node-header-addons">
                        {afterTitle}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NodeHeader;
