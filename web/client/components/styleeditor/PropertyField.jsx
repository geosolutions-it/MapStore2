/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Message from '../I18N/Message';

function PropertyField({ children, label, tools, divider, invalid }) {

    if (divider) {
        return <div className="ms-symbolizer-field-divider"></div>;
    }
    const validationClassName = invalid ? ' ms-symbolizer-value-invalid' : '';
    return (
        <div
            className="ms-symbolizer-field">
            <div className="ms-symbolizer-label"><Message msgId={label} /></div>
            <div className={'ms-symbolizer-value' + validationClassName}>
                {children}
                <div className="ms-symbolizer-tools">
                    {tools}
                </div>
            </div>
        </div>
    );
}

export default PropertyField;
