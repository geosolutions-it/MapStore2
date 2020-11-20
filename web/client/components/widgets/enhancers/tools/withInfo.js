/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {compose, withProps} from 'recompose';

/**
 * Add widget info tool to show widget description.
 * Does not apply to text widgets, that already contains description
 */
export default () =>
    compose(
        withProps(({ widgetTools = [], title, description, widgetType}) => ({
            widgetTools: !!description && widgetType !== "text"
                ? [
                    ...widgetTools,
                    {
                        glyph: "question-sign",
                        popover: { // text widget should not show info popover
                            title,
                            trigger: true,
                            text: description
                        },
                        target: 'icons'
                    }]
                : widgetTools
        }))
    );
