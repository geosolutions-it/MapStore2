/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Title from './Title';

/**
 * Header for layer or group nodes component
 * @prop {object} node node options
 * @prop {string} filterText text to filter the title
 * @prop {string} currentLocale current locale code
 * @prop {object} tooltipOptions title tooltip options
 * @prop {node} beforeTitle components rendered before the title
 * @prop {node} afterTitle components rendered after the title
 * @prop {function} onClick returns the click event
 * @prop {string} className custom class name
 * @prop {boolean} showTitleTooltip show the title tooltip
 */
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
