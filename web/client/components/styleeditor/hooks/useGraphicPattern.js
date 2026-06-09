/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
import GraphicPattern from "../GraphicPattern/GraphicPattern";

function useGraphicPattern(symbolizer, type) {
    return useMemo(() => {
        if (type === 'line' && !symbolizer?.["graphic-stroke"]) {
            return {
                defs: null,
                stroke: symbolizer?.stroke
            };
        }
        if (type === 'polygon' && !symbolizer?.["graphic-fill"]) {
            return {
                defs: null,
                fill: symbolizer?.fill
            };
        }
        const patternId = "pattern-" + uuidv4();
        return {
            defs: <GraphicPattern id={patternId} symbolizer={symbolizer} type={type} />,
            ...(type === 'line' ? { stroke: `url(#${patternId})` } : {}),
            ...(type === 'polygon' ? { fill: `url(#${patternId})` } : {})
        };
    }, [symbolizer, type]);
}

export default useGraphicPattern;
