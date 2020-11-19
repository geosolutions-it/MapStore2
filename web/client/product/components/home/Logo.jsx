/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import logo1 from '../../assets/img/mapstorelogo.png';
import logo2 from '../../assets/img/MapStore2.png';

class Logo extends React.Component {
    render() {
        return (<div>
            <img src={logo1} className="mapstore-logo" />
            <img src={logo2} className="mapstore-logo" />
        </div>);
    }
}

export default Logo;
