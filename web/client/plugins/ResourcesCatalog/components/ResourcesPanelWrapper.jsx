/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import FlexBox from '../../../components/layout/FlexBox';

const ResourcesPanelWrapper = forwardRef(({
    top,
    bottom,
    show,
    enabled,
    children,
    className,
    editing
}, ref) => {
    return enabled ? (
        <FlexBox
            classNames={[
                'ms-resources-panel-wrapper',
                '_pointer-events-none',
                '_fixed'
            ]}
            style={{
                top: top,
                bottom: bottom,
                width: '100%',
                visibility: show ? 'visible' : 'hidden',
                ...(editing && {
                    pointerEvents: 'auto',
                    background: 'rgba(0, 0, 0, 0.2)'
                })
            }}
        >
            <div
                ref={ref}
                className={`ms-main-colors${className ? ` ${className}` : ''}${show ? ' _visible' : ''} _pointer-events-auto _overflow-auto _relative`}
            >
                {show ? children : null}
            </div>
        </FlexBox>
    ) : null;
});

export default ResourcesPanelWrapper;
