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

function StyleBasedLegend({ style }) {

    const renderRules = (rules) => {
        return (rules || []).map((rule) => {
            return (<div className="wfs-legend-rule" key={rule.ruleId}>
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
    style: PropTypes.object
};

export default StyleBasedLegend;
