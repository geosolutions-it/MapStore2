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
    filterReloadDelay = 0,
    setFilterReloadDelay = () => {},
    onTriggerReload = () => {},
    loadFirst = () => {},
    ...props
}) => {
    const [filterText, setFilterText] = React.useState('');

    React.useEffect(() => {
        // temporary solution to a backend problem
        setTimeout(() => {
            loadFirst({searchText: filterText});
        }, filterReloadDelay || 0);
    }, [filterText, triggerReloadValue, loadFirst]);

    return (
        <Component
            {...props}
            filterText={filterText}
            onFilter={(text, delay) => {
                setFilterReloadDelay(delay);
                setFilterText(text);
            }}
            onReloadFilter={(delay) => {
                setFilterReloadDelay(delay);
                onTriggerReload();
            }}/>
    );
};
