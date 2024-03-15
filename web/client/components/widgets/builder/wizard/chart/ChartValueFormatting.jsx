/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Format from '../common/Format';
import Formula from '../common/Formula';
/**
 * ChartValueFormatting. A component that renders field to format a chart value
 * @prop {string|node} title main title
 * @prop {object} options data options
 * @prop {function} onChange callback on every input change
 * @prop {boolean} hideFormula hide formula field
 */
function ChartValueFormatting({
    title,
    options = {},
    onChange = () => {},
    hideFormula
}) {
    return (
        <>
            {title && <div className="ms-wizard-form-separator">
                {title}
            </div>}
            <Format
                data={{ options }}
                prefix="options"
                onChange={(key, value) => {
                    onChange(key.replace('options.', ''), value);
                }}
            />
            {!hideFormula && <Formula
                data={options}
                onChange={(key, value) => onChange(key, value)}
            />}
        </>
    );
}

export default ChartValueFormatting;
