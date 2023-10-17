/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, ControlLabel } from 'react-bootstrap';

import Message from '../../../../I18N/Message';
import Format from './Format';
import Formula from './Formula';
import SwitchPanel from '../../../../misc/switch/SwitchPanel';
import SwitchButton from '../../../../misc/switch/SwitchButton';

function Header({}) {
    return (<span>
        <span style={{ cursor: "pointer" }}><Message msgId="widgets.advanced.title"/></span>
    </span>);
}


function PieChartAdvancedOptions({
    data,
    onChange = () => {}
}) {
    return (<SwitchPanel id="displayCartesian"
        header={<Header data={data}/>}
        collapsible
        expanded={data.panel}
        onSwitch={(val) => { onChange("panel", val); }}
    >
        <FormGroup controlId="AdvancedOptions">
            <Format data={data} onChange={onChange}/>
            <Formula data={data} onChange={onChange}/>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.hideLabels" />
            </Col>
            <Col sm={6}>
                <SwitchButton
                    checked={data?.yAxisOpts?.textinfo === "none"}
                    onChange={(val) => { onChange("yAxisOpts.textinfo", val ? "none" : null); }}
                />
            </Col>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.includeLegendPercent" />
            </Col>
            <Col sm={6}>
                <SwitchButton
                    checked={data?.includeLegendPercent ?? false}
                    onChange={(val) => { onChange("yAxisOpts.includeLegendPercent", val); }}
                />
            </Col>

        </FormGroup>
    </SwitchPanel>);
}

PieChartAdvancedOptions.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func
};

export default PieChartAdvancedOptions;
