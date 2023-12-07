/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { withProps, compose } from 'recompose';
import isNil from 'lodash/isNil';

/**
 * Returns an enhancer that add `stepButtons` for viewport connection to a wizard toolbar
 * @param {function} showCondition parses props to allow visualization of the buttons (if other connect condition are satisfied)
 */
export default (showCondition = () => true) => compose(
    withProps(({
        disableMultiDependencySupport,
        stepButtons = [],
        toggleConnection = () => { },
        availableDependencies = [],
        canConnect,
        connected,
        ...props
    }) => {
        const disableConnect = !isNil(disableMultiDependencySupport) ? disableMultiDependencySupport : !canConnect;
        return {
            stepButtons: [
                ...stepButtons,
                {
                    onClick: () => toggleConnection(availableDependencies, props.widgets),
                    disabled: disableConnect,
                    visible: !!showCondition(props) && availableDependencies.length > 0,
                    bsStyle: (!disableMultiDependencySupport && connected) ? "success" : "primary",
                    glyph: connected ? "plug" : "unplug",
                    tooltipId: disableConnect
                        ? "widgets.builder.wizard.disableConnectToMap"
                        : connected
                            ? "widgets.builder.wizard.clearConnection"
                            : availableDependencies.length === 1
                                ? "widgets.builder.wizard.connectToTheMap"
                                : "widgets.builder.wizard.connectToAMap"
                }
            ]
        };
    })
);
