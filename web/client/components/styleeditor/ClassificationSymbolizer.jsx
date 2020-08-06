/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import isFunction from 'lodash/isFunction';
import Fields from './Fields';
import Symbolizer, { SymbolizerMenu } from './Symbolizer';

function ClassificationSymbolizer({
    ruleId,
    glyph,
    params,
    kind,
    symbolizerKind,
    classificationType = 'classificationVector',
    attributes = [],
    onUpdate,
    onReplace,
    methods,
    getColors = () => {},
    ruleBlock = {},
    symbolizerBlock = {},
    bands,
    ...props
}) {

    const {
        ramp,
        method,
        classification,
        attribute,
        intervals,
        reverse,
        continuous
    } = props;

    // needed for slider
    // slider usea component should update so value inside onChange was never update
    // with a ref we can get the latest update value
    const state = useRef();
    state.current = {
        ruleId,
        intervals,
        method,
        attribute,
        reverse,
        ramp,
        continuous,
        classification
    };

    function handleColors() {
        const customRamp = ramp === 'custom' && classification.length > 0
            && { name: 'custom', colors: classification.map((entry) => entry.color) };
        const colorsRamps = getColors(undefined, undefined, 5, customRamp);
        if (colorsRamps) {
            return colorsRamps.map(({name, ...color}) => ({
                label: name ? `global.colors.${name}` : undefined,
                name,
                ...color
            }));
        }
        return [];
    }

    const mergedParams = params.reduce((acc, paramsBlock) => {
        if (isFunction(paramsBlock)) {
            return { ...acc, ...paramsBlock(symbolizerKind) };
        }
        return { ...acc, ...paramsBlock };
    }, {});

    const { glyph: symbolizerGlyph } = symbolizerBlock[symbolizerKind] || {};

    return (
        <Symbolizer
            key="Classification"
            glyph={symbolizerGlyph || glyph}
            tools={<SymbolizerMenu
                ruleKind={kind}
                symbolizerKind={symbolizerKind}
                ruleId={ruleId}
                onSelect={onReplace}
                ruleBlock={ruleBlock}
                symbolizerBlock={symbolizerBlock}
            />}>
            <Fields
                properties={props}
                config={{
                    attributes,
                    methods,
                    getColors: handleColors,
                    bands,
                    method
                }}
                params={mergedParams}
                onChange={(values) => onUpdate({
                    ...state.current,
                    type: classificationType,
                    values
                })}
            />
        </Symbolizer>
    );
}

export default ClassificationSymbolizer;
