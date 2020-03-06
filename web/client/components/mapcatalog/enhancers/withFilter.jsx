/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

export default (Component) => ({
    triggerReloadValue = false,
    onTriggerReload = () => {},
    loadFirst = () => {},
    ...props
}) => {
    const [filterText, setFilterText] = React.useState('');

    React.useEffect(() => {
        loadFirst({searchText: filterText});
    }, [filterText, triggerReloadValue, loadFirst]);

    return (
        <Component
            {...props}
            filterText={filterText}
            onFilter={setFilterText}
            onReloadFilter={() => onTriggerReload()}/>
    );
};
