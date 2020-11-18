/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import PagedCombobox from './PagedCombobox';

// state enhancer for local props
import addState from './addState';

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

export default ControlledCombobox;
