/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';
import classnames from 'classnames';

const InfoBubble = ({
    show,
    arrowDirection = 'bottom',
    className,
    containerClassName,
    children
}) => (
    <div className={classnames(...['mapstore-info-bubble', ...(show ? ['mapstore-info-bubble-visible'] : []), className])}>
        <div className={classnames('mapstore-info-bubble-container', containerClassName)}>
            <div className={classnames('mapstore-info-bubble-arrow-container', `arrow-${arrowDirection}`)}>
                <div className="mapstore-info-bubble-arrow"/>
            </div>
            <div className="mapstore-info-bubble-inner">
                {children}
            </div>
        </div>
    </div>
);

export default InfoBubble;
