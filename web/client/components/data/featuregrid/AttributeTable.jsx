/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {forwardRef} from 'react';

import ReactDataGrid from 'react-data-grid';
import Message from '../../I18N/Message';
import withHint from "./enhancers/withHint";
import {Glyphicon} from "react-bootstrap";

const TooltipSpan = withHint(forwardRef(({glyph, className = "attribute error", children, ...props }, ref) => {
    return (<span ref={ref} {...props} className={className}><s>{children}</s><Glyphicon glyph={glyph} /></span>);
}));

export default ({
    style = {},
    titleMsg = "featuregrid.columns",
    onChange = () => { },
    attributes = []
} = {}) => (
    <div className="bg-body data-attribute-selector" style={style}>
        <h4 className="text-center"><strong><Message msgId={titleMsg} /></strong></h4>
        <ReactDataGrid
            rowKey="id"
            columns={[{
                name: '',
                key: 'attribute',
                formatter(props) {
                    return props?.row?.error
                        ? <TooltipSpan glyph="alert" tooltipId="widgets.builder.wizard.attributeIsNotAvailable">{props.row.name}</TooltipSpan>
                        : (props.row.name ?? null);
                }
            }]}
            rowGetter={idx => attributes[idx]}
            rowsCount={attributes.length}
            rowSelection={{
                showCheckbox: true,
                enableShiftSelect: true,
                onRowsSelected: rows => onChange(rows.map(row => attributes[row.rowIdx].name), false),
                onRowsDeselected: rows => onChange(rows.map(row => attributes[row.rowIdx].name), true),
                selectBy: {
                    indexes: attributes.reduce( (acc, a, idx) => [...acc, ...(a.hide ? [] : [idx] )], [])
                }
            }}
        />
    </div>
);
