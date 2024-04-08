/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import RuleLegendIcon from '../../styleeditor/RuleLegendIcon';
import {parseGeoStylerFilterToCql} from '../../../utils/StyleEditorUtils';
function StyleBasedLegend({ style, layer, onLayerFilterByLegend }) {

    const handleLegendFilter = (filter) => {
        if (!layer?.enableInteractiveLegend || !layer?.visibility) return;
        const cql = filter ? parseGeoStylerFilterToCql(filter) : filter;
        const isLegendFilterIncluded = layer?.layerFilter?.filters?.find(f=>f.id === 'interactiveLegend');
        const prevFilter = isLegendFilterIncluded ? isLegendFilterIncluded?.filters?.[0]?.body : '';
        onLayerFilterByLegend(layer.id, 'layers', cql === prevFilter ? '' : cql);
    };
    const renderRules = (rules) => {
        return (rules || []).map((rule) => {
            const isLegendFilterIncluded = layer?.layerFilter?.filters?.find(f=>f.id === 'interactiveLegend');
            const prevFilter = isLegendFilterIncluded ? isLegendFilterIncluded?.filters?.[0]?.body : '';
            // if isLegendFilterIncluded && rule.filter ---> get cql to compare current with prev filter
            const ruleFilter = rule.filter && isLegendFilterIncluded ? parseGeoStylerFilterToCql(rule.filter) : '';

            return (<div className={`wfs-legend-rule ${layer?.enableInteractiveLegend && layer?.visibility ? 'json-legend-rule' : ''} ${ruleFilter && prevFilter === ruleFilter ? 'active' : ''}`} key={rule.ruleId || rule.name} onClick={()=>handleLegendFilter(rule?.filter)}>
                <RuleLegendIcon rule={rule} />
                <span>{rule.name || ''}</span>
            </div>);
        });
    };

    return <>
        {
            style.format === 'geostyler' && <div className="wfs-legend">
                {renderRules(style.body.rules)}
            </div>
        }
    </>;
}

StyleBasedLegend.propTypes = {
    style: PropTypes.object,
    layer: PropTypes.object,
    onLayerFilterByLegend: PropTypes.func
};

export default StyleBasedLegend;
