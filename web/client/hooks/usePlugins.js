/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import isFunction from 'lodash/isFunction';
import { getConfiguredPlugin } from '../utils/PluginsUtils';

const usePlugins = (props, context, update = [], Loader) => {
    const [ plugins, setPlugins ] = useState([]);
    useEffect(() => {
        const items = [...(props.items || [])]
            .filter(({ hide }) => !hide || hide && !hide(props))
            .sort((a, b) => a.position > b.position ? 1 : -1);
        setPlugins(items
            .map(plg => ({
                ...plg,
                Component: getConfiguredPlugin(plg, context.loadedPlugins, isFunction(Loader) && <Loader name={plg.name}/> || Loader || <div />)
            })) || []);
    }, update);
    return plugins;
};

export default usePlugins;
