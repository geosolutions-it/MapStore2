/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDataGrid = require('react-data-grid');
const Message = require('../../I18N/Message');

module.exports = ({
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
                key: 'attribute'
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
            }} />
    </div>
);
