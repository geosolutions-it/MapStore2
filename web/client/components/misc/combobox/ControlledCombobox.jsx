/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PagedCombobox = require('./PagedCombobox');

// state enhancer for local props
const addState = require('./addState');

const ControlledCombobox = addState(({ toggle, select, focus, change, value, busy, data, loading = false, filter, open }) => {
    return (<PagedCombobox
        pagination={{paginated: false}}
        onFocus={focus}
        onToggle={toggle}
        onChange={change}
        onSelect={select}
        selectedValue={value}
        dropUp={false}
        busy={busy}
        data={data}
        open={open}
        loading={loading}
        filter={filter}
    />);
});

module.exports = ControlledCombobox;
