/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FormGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Message from '../../../../I18N/Message';
import Format from './Format';
import Formula from './Formula';
import SwitchPanel from '../../../../misc/switch/SwitchPanel';

function Header({}) {
    return (<span>
        <span style={{ cursor: "pointer" }}><Message msgId="widgets.advanced.title"/></span>
    </span>);
}

function CounterAdvancedOptions({
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
            <Format prefix="counterOpts" data={data} onChange={onChange}/>
            <Formula data={data} onChange={onChange}/>
        </FormGroup>
    </SwitchPanel>);
}

CounterAdvancedOptions.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func
};

export default CounterAdvancedOptions;
