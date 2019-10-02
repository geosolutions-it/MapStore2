/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {Suspense, useState, useCallback} from 'react';
import ReactDOM from 'react-dom';

const HooksApp1 = React.lazy(() => import('./components/HooksApp'));
const HooksApp2 = React.lazy(() => import('./components/HooksAppRedux'));

import ConfigUtils from '../../utils/ConfigUtils';
ConfigUtils.setConfigProp('proxyUrl', {
    url: '',
    autoDetectCORS: true
});

import AppContext from './appContext';

const App = () => {
    const [mode, setMode] = useState('simple');
    const AppComponent = mode === 'simple' ? HooksApp1 : HooksApp2;
    const onChange = useCallback((e) => {
        setMode(e.target.value);
    });

    return (
        <AppContext.Provider value={mode}>
            <label>Simple: <input type="radio" name="mode" value="simple" checked={mode === 'simple'} onChange={onChange}/></label>
            <label>Redux: <input type="radio" name="mode" value="redux" checked={mode === 'redux'} onChange={onChange}/></label>
            <Suspense fallback={<div>Loading...</div>}>
                <AppComponent/>
            </Suspense>
        </AppContext.Provider>
    );
};

ReactDOM.render((
    <App/>
), document.getElementById('container'));
