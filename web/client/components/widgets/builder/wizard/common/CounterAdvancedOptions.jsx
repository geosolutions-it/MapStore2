/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Format from './Format';
import Formula from './Formula';
import Message from '../../../../I18N/Message';
import Font from './Font';
import { FONT } from '../../../../../utils/WidgetsUtils';


function CounterAdvancedOptions({
    data,
    onChange = () => {}
}) {
    return (
        <>
            <div className="ms-wizard-form-separator">
                <Message msgId="widgets.advanced.valueFormatting" />
            </div>
            <Format prefix="counterOpts" data={data} onChange={onChange}/>
            <Formula data={data} onChange={onChange}/>
            <Font
                color={data?.counterOpts?.layout?.color || FONT.COLOR}
                disabled={false}
                fontFamily={data?.counterOpts?.layout?.fontFamily || FONT.FAMILY}
                options={["color",  "family"]}
                onChange={(key, val) => {
                    onChange(`counterOpts.layout.${key}`, val);
                }}
            />
        </>
    );
}

CounterAdvancedOptions.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func
};

export default CounterAdvancedOptions;
