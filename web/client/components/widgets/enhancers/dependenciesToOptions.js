/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withPropsOnChange } from 'recompose';

import { getDependencyLayerParams } from './utils';
import { find } from 'lodash';

/**
 * Update chart layer options with params
 * @param layerOptions
 * @param selectedChartId
 * @param options
 * @returns {{layerOptions: *}}
 */
const getChartOptions = ({layerOptions, selectedChartId}, options) => {
    return {
        layerOptions: layerOptions?.map(layerProp => {
            if (layerProp.chartId === selectedChartId) {
                return ({ ...layerProp, options });
            }
            return layerProp;
        })
    };
};
/**
 * Merges options and original layer's data to get the final options (with viewParams added)
 */
export default compose(
    withPropsOnChange(
        ['dependencies', 'options'],
        ({ dependencies = {}, options, layer = {}, ...props} = {}) => {
            const params = getDependencyLayerParams(layer, dependencies);
            const viewParamsKey = find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "viewparams");
            const viewParams = params && viewParamsKey && params[viewParamsKey];
            const _options = viewParams ? { ...options, viewParams} : options;
            return {
                ...getChartOptions(props, _options),
                options: _options
            };
        }
    )

);
