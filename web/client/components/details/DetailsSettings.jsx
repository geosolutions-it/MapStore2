/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { toPairs, isBoolean } from 'lodash';
import { Checkbox } from 'react-bootstrap';

import Message from '../I18N/Message';

export default ({
    style = {display: 'flex', flexDirection: 'column'},
    settings = {},
    onChange = () => {}
}) => {
    const renderBoolean = (id, value) => (
        <Checkbox checked={value} onClick={() => onChange(id, !value)}>
            <Message msgId={`details.${id}`}/>
        </Checkbox>
    );

    return (
        <div style={style}>
            {toPairs(settings).filter(setting => isBoolean(setting[1])).map(setting => renderBoolean(...setting))}
        </div>
    );
};
