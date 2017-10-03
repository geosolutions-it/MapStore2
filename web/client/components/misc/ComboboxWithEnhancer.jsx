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
const {addStateHandlers} = require('./enhancer/basic');

const ComboboxWithEnhancer = addStateHandlers(({ open, toggle, select, focus, change, value, busy, data, loading = false }) => {
    return (<PagedCombobox
        pagination={{paginated: false}}
        busy={busy} dropUp={false} data={data} open={open}
        onFocus={focus} onToggle={toggle} onChange={change} onSelect={select}
        selectedValue={value} loading={loading}/>);
});

module.exports = {
    ComboboxWithEnhancer
};
