/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {branch, nest} from 'recompose';
import FocusMask from '../../../../misc/FocusMask';

/**
 * Configure FocusMask for geostory map editing
 *
 * @param {function} showFocusMask function that returns true if the mask have to be shown. Gets props as argument
 * @param {object} options for the focus mask:
 *  - padding: padding around focused targets
 *  - borderRadius: hole border radius
 *  - stopEventsOnTargets: stop passing events to targets
 *  - onMaskClicked: onMaskClicked optional
 */
export default (
    {
        showFocusMask = () => {},
        defaultTargets = {selector: '.ms-geostory-map-editor'}
    },
    {
        padding =  0,
        borderRadius = 8,
        stopEventsOnTargets = false,
        onMaskClicked = () => {}
    } = {},
) => branch(
    showFocusMask,
    (A) => nest(({focusedContent, children}) => {
        return (
            <React.Fragment>
                {children}
                <FocusMask
                    targets={[focusedContent, defaultTargets]}
                    padding={padding}
                    borderRadius={borderRadius}
                    stopEventsOnTargets={stopEventsOnTargets}
                    onMaskClicked={onMaskClicked}
                />
            </React.Fragment>);
    }
    , A));
