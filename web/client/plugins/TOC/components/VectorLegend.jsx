/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { Alert } from 'react-bootstrap';

import Message from '../../../components/I18N/Message';
import { ButtonWithTooltip } from '../../../components/misc/Button';
import RuleLegendIcon from '../../../components/styleeditor/RuleLegendIcon';
import { INTERACTIVE_LEGEND_ID } from '../../../utils/LegendUtils';
import { updateLayerWFSVectorLegendFilter } from '../../../utils/FilterUtils';
import { getMiscSetting } from '../../../utils/ConfigUtils';

/**
 * VectorLegend renders the legend given a valid vector style
 * @prop {object} style a layer style object in geostyler format
 * @prop {object} layer the vector layer object
 * @prop {boolean} interactive the indicator flag that refers if this legend is interactive or not
 * @prop {function} onChange the onChange layer handler
 */
function VectorLegend({ style, layer, interactive, onChange }) {
    const onResetLegendFilter = () => {
        const newLayerFilter = updateLayerWFSVectorLegendFilter(layer?.layerFilter);
        onChange({ layerFilter: newLayerFilter });
    };
    const filterLayerHandler = (filter) => {
        const newLayerFilter = updateLayerWFSVectorLegendFilter(layer?.layerFilter, filter);
        onChange({ layerFilter: newLayerFilter });
    };
    const checkPreviousFiltersAreValid = (rules, prevLegendFilters) => {
        const rulesFilters = rules.map(rule => rule?.filter?.toString());
        return prevLegendFilters?.every(f => rulesFilters.includes(f.id));
    };
    const renderRules = (rules) => {
        const layerFilter = get(layer, 'layerFilter', {});
        const interactiveLegendFilters = get(layerFilter, 'filters', []).find(f => f.id === INTERACTIVE_LEGEND_ID);
        const legendFilters = get(interactiveLegendFilters, 'filters', []);
        const showResetWarning = !checkPreviousFiltersAreValid(rules, legendFilters) && !layerFilter.disabled;
        const experimentalInteractiveLegend = getMiscSetting('experimentalInteractiveLegend', false);
        const isNotInteractiveLegend = !(interactive && layer?.enableInteractiveLegend && experimentalInteractiveLegend);
        return (<>
            {showResetWarning && !isNotInteractiveLegend ? <Alert bsStyle="warning">
                <div><Message msgId={"layerProperties.interactiveLegend.incompatibleWFSFilterWarning"} /></div>
                <ButtonWithTooltip
                    bsStyle="primary"
                    bsSize="xs"
                    style={{ marginTop: 4 }}
                    onClick={onResetLegendFilter}>
                    <Message msgId={"layerProperties.interactiveLegend.resetLegendFilter"} />
                </ButtonWithTooltip>
            </Alert> : null}
            {isEmpty(rules)
                ? <Message msgId={"layerProperties.interactiveLegend.noLegendData"} />
                : (rules || []).map((rule, idx) => {
                    const isFilterDisabled = layer?.layerFilter?.disabled;
                    const activeFilter = legendFilters?.some(f => f.id === rule?.filter?.toString());
                    const isLegendFilterNotApplicable = isFilterDisabled || isNotInteractiveLegend || !rule?.filter;

                    return (<div key={`${rule.filter}-${idx}`}
                        onClick={() => {
                            // don't call filter handler if it is not interactive legend or filter is disabled or the filter rule is not truthy value
                            if (isLegendFilterNotApplicable) return;
                            filterLayerHandler(rule.filter);
                        }}
                        className={`ms-legend-rule ${isLegendFilterNotApplicable ? "" : "filter-enabled "} ${activeFilter && interactive ? 'active' : ''}`}>
                        <RuleLegendIcon rule={rule} />
                        <span>{rule.name || ''}</span>
                    </div>);
                })}
        </>);
    };

    return <>
        {
            style.format === 'geostyler' && <div className="ms-legend">
                {renderRules(style.body.rules)}
            </div>
        }
    </>;
}

VectorLegend.propTypes = {
    style: PropTypes.object,
    layer: PropTypes.object,
    interactive: PropTypes.bool,
    onChange: PropTypes.func
};

export default VectorLegend;
