/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Loader from '../../misc/Loader';
import Message from '../../I18N/Message';

export default () => (<div style={{
    margin: 'auto',
    maxWidth: 550
}}>
    <Loader
        size={80}
        color="#ffffff"
        style={{
            margin: 'auto'
        }}/>
    <h4>
        <Message msgId="loading" />
    </h4>
</div>);
