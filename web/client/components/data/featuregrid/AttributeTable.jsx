/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { castArray, includes, uniqBy, isEmpty } from "lodash";

import Message from '../../I18N/Message';
import localizedProps from '../../misc/enhancers/localizedProps';
import FormatEditor from "../../data/featuregrid/editors/FormatEditor";

const DataGrid = localizedProps("columns", "name")(ReactDataGrid);

// Update property name on row selection operation
const updatePropertyName = (arr, names, hide) => {
    const _names = castArray(names);
    if (hide) {
        return arr.filter(e => !includes(_names, e.name));
    }
    return uniqBy([...arr, ..._names.map(n => ({name: n}))], 'name');
};
const range = (start, end) => Array.from({length: (end + 1 - start)}, (v, k) => k + start);

// Editor with format regex
const getEditor = (formatRegex) => <FormatEditor dataType="string" formatRegex={formatRegex}/>;

// Columns for configuring table options
const columns = [{
    name: 'widgets.builder.wizard.attributeEditorColumns.name',
    key: 'label',
    width: 120
}, {
    name: 'widgets.builder.wizard.attributeEditorColumns.title',
    key: 'title',
    editor: getEditor("^[-@.\\/\#&+\\w\\s*]{0,100}$"),
    width: 120,
    editable: (rowData) => !rowData?.hide
}, {
    name: 'widgets.builder.wizard.attributeEditorColumns.tooltip',
    key: 'description',
    editor: getEditor("^[-@.,\\/\#&+\\w\\s*]{0,200}$"),
    width: 150,
    editable: (rowData) => !rowData?.hide
}];

export default ({
    style = {},
    titleMsg = "featuregrid.columns",
    onChange = () => { },
    attributes = [],
    options = {}
} = {}) => {
    const rowGetter = idx => attributes[idx];

    const onGridRowsUpdated = ({fromRow, toRow, updated}) => {
        const [{name} = {}] = range(fromRow, toRow).map((r) => rowGetter(r))
            .filter(f => Object.keys(updated || {})
                .filter(k => f[k] !== updated[k]).length > 0);

        !isEmpty(name) && onChange("options.propertyName",
            options.propertyName.map(p => name === p.name ? ({...p, ...updated}) : p)
        );
    };

    const onRowsSelectOperation = (names, hide) => {
        onChange("options.propertyName", updatePropertyName(options && options.propertyName || [], names, hide));
    };

    return (<div className="bg-body data-attribute-selector" style={style}>
        <h4 className="text-center"><strong><Message msgId={titleMsg}/></strong></h4>
        <DataGrid
            rowKey="id"
            columns={columns}
            enableCellSelect
            rowGetter={rowGetter}
            rowsCount={attributes.length}
            onGridRowsUpdated={onGridRowsUpdated}
            rowSelection={{
                showCheckbox: true,
                enableShiftSelect: true,
                onRowsSelected: rows => onRowsSelectOperation(rows.map(row => attributes[row.rowIdx].name), false),
                onRowsDeselected: rows => onRowsSelectOperation(rows.map(row => attributes[row.rowIdx].name), true),
                selectBy: {
                    indexes: attributes.reduce((acc, a, idx) => [...acc, ...(a.hide ? [] : [idx])], [])
                }
            }}/>
    </div>);
};
