/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { withProps, compose } from 'recompose';
import isNil from 'lodash/isNil';
import { WIDGETS_REGEX } from '../../../../actions/widgets';

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
        widgets = [],
        ...props
    }) => {
        const disableConnect = !isNil(disableMultiDependencySupport) ? disableMultiDependencySupport : !canConnect;
        const isSingleDependency = availableDependencies.length === 1;
        let isTableOnlyWidget = false;
        if (isSingleDependency) {
            const [, dependencyId] = WIDGETS_REGEX.exec(availableDependencies[0]) ?? [];
            isTableOnlyWidget = widgets?.find(widget => dependencyId === widget.id)?.widgetType === "table";
        }
        return {
            stepButtons: [
                ...stepButtons,
                {
                    onClick: () => toggleConnection(availableDependencies, widgets),
                    disabled: disableConnect,
                    visible: !!showCondition(props) && availableDependencies.length > 0,
                    bsStyle: (!disableMultiDependencySupport && connected) ? "success" : "primary",
                    glyph: connected ? "plug" : "unplug",
                    tooltipId: disableConnect
                        ? "widgets.builder.wizard.disableConnectToMap"
                        : connected
                            ? "widgets.builder.wizard.clearConnection"
                            : isSingleDependency
                                ? isTableOnlyWidget
                                    ? "widgets.builder.wizard.connectToTheTable"
                                    : "widgets.builder.wizard.connectToTheMap"
                                : "widgets.builder.wizard.connectToAMap"
                }
            ]
        };
    })
);
