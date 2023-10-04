/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Message from '../I18N/Message';
import InfoPopover from '../widgets/widget/InfoPopover';

function PropertyField({ children, label, tools, divider, invalid, warning, disabled, valueStyle, infoMessageId }) {

    if (divider) {
        return <div className="ms-symbolizer-field-divider"></div>;
    }
    const warningClassName = warning ? ' ms-symbolizer-value-warning' : '';
    const validationClassName = invalid ? ' ms-symbolizer-value-invalid' : '';
    const disabledClassName = disabled ? ' ms-symbolizer-field-disabled' : '';
    return (
        <div
            className={'ms-symbolizer-field' + disabledClassName}>
            <div className="ms-symbolizer-label">
                <Message msgId={label} />
                {infoMessageId ? <>&nbsp;<InfoPopover text={<Message msgId={infoMessageId} />}/></> : null}
            </div>
            <div
                className={'ms-symbolizer-value' + validationClassName + warningClassName}
                style={valueStyle}
                // prevent drag and drop when interacting with property input
                onDragStart={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
                draggable>
                {children}
                <div className="ms-symbolizer-tools">
                    {tools}
                </div>
            </div>
        </div>
    );
}

export default PropertyField;
