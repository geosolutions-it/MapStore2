/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
// const Combobox = require('react-widgets').Combobox;
const PagedCombobox = require('./PagedCombobox');

const {addStateHandlers} = require('./enhancer/basic');

// component enhanced with props from stream, and local state
const ComboboxEnhanced =
    ({ open, toggle, select, focus, change, value, busy, data, loading = false }) => {
        return (<PagedCombobox
            pagination={{paginated: false}}
            busy={busy} dropUp={false} data={data} open={open}
            onFocus={focus} onToggle={toggle} onChange={change} onSelect={select}
            selectedValue={value} loading={loading}/>);
    };

// state enhancer for local props


const ComboboxWithEnhancer = addStateHandlers(ComboboxEnhanced);

module.exports = {
    ComboboxWithEnhancer
};
