/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useEffect, useState } from 'react';
import { withResizeDetector } from 'react-resize-detector';
import tooltip from '../../../components/misc/enhancers/tooltip';
import { getTitleAndTooltip } from '../utils/TOCUtils';

const NodeTitle = tooltip(({ children, titleRef, idDropDown, keyProp, ...props }) => {
    return <div {...props} ref={titleRef} className="ms-node-title">{children}</div>;
});

/**
 * Title component for TOC nodes
 * @prop {object} node node configuration
 * @prop {string} filterText filter to apply to node title
 * @prop {string} currentLocale current locale code
 * @prop {object} tooltipOptions options for title tooltip
 * @prop {boolean} showTooltip show the tooltip
 */
const Title = ({
    node = {},
    filterText = '',
    currentLocale,
    tooltipOptions,
    showTooltip,
    width,
    showFullTitle
}) => {
    const ref = useRef();
    const [shouldShowTooltip, setShouldShowTooltip] = useState(false);
    const { title: value = '', tooltipText = '' } = getTitleAndTooltip({ node, currentLocale, tooltipOptions });
    const tooltipValue = showTooltip && shouldShowTooltip ? tooltipText : undefined;

    useEffect(() => {
        // if the tooltip text is the same of the title value
        // and the text is completely visible we should hide the tooltip
        // Note: we need a use effect to have the ref ready
        setShouldShowTooltip(!(tooltipText === value && !(ref.current.clientWidth < ref.current.scrollWidth)));
    }, [value, tooltipText, width, showFullTitle]);

    const id = `title-tooltip-${node?.id}`;
    const tooltipPosition = node?.tooltipPlacement || 'top';
    if (!filterText) {
        return (<NodeTitle titleRef={ref} idDropDown={id} keyProp={id} tooltip={tooltipValue} tooltipPosition={tooltipPosition} >{value}</NodeTitle>);
    }
    const regularExpression = new RegExp(filterText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi');
    const matches = value.match(regularExpression);
    if (!matches) {
        return (<NodeTitle titleRef={ref} idDropDown={id} keyProp={id} tooltip={tooltipValue} tooltipPosition={tooltipPosition}>{value}</NodeTitle>);
    }
    return (<NodeTitle titleRef={ref} idDropDown={id} keyProp={id} tooltip={tooltipValue} tooltipPosition={tooltipPosition}>
        {value.split(regularExpression)
            .map((split, idx) => {
                if (idx < matches.length) {
                    return (<React.Fragment key={idx}>
                        {split}
                        <mark >{matches[idx]}</mark>
                    </React.Fragment>);
                }
                return (<React.Fragment key={idx}>{split}</React.Fragment>);
            })}
    </NodeTitle>);
};

// we need to detect width changes to decide if the tooltip should be visible or not
export default withResizeDetector(Title);
