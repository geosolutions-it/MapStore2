/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import RuleLegendIcon from '../../../components/styleeditor/RuleLegendIcon';
/**
 * VectorLegend renders the legend given a valid vector style
 * @prop {object} style a layer style object in geostyler format
 */
function VectorLegend({ style }) {

    const renderRules = (rules) => {
        return (rules || []).map((rule) => {
            return (<div className="ms-legend-rule" key={rule.ruleId}>
                <RuleLegendIcon rule={rule} />
                <span>{rule.name || ''}</span>
            </div>);
        });
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
    style: PropTypes.object
};

export default VectorLegend;
