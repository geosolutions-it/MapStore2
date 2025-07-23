/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withPropsOnChange } from 'recompose';
import { addCurrentTimeShapes } from '../../../utils/WidgetsUtils';

const getShapesFromDependencies = ({ dependencies = {}, xAxisOpts, yAxisOpts, layout = {} }) => {
    const resolvedTimeRange = {
        start: dependencies["dimension.currentTime"],
        end: dependencies["dimension.offsetTime"]
    };
    // If resolvedTimeRange is not set or invalid, return data as is
    if (!resolvedTimeRange || (!resolvedTimeRange.start && !resolvedTimeRange.end)) {
        return { layout };
    }
    const currentTimeShapes = addCurrentTimeShapes({ xAxisOpts, yAxisOpts }, resolvedTimeRange);
    if (!currentTimeShapes || currentTimeShapes.length === 0) {
        return { layout };
    }
    return {
        layout: {
            ...layout,
            shapes: [...(layout?.shapes || []), ...currentTimeShapes]
        }
    };
};

/**
 * Enhancer that adds timeline traces to chart data based on dependencies
 * Uses the timeRange from dependencies to create visual timeline overlays
 */
export default compose(
    withPropsOnChange(
        ['dependencies', 'data', 'charts'],
        (props = {}) => getShapesFromDependencies(props)
    )
);
