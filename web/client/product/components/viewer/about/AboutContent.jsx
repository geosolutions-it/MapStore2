/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import I18N from '../../../../components/I18N/I18N';


class About extends React.Component {
    render() {
        return (
            <div className="about-content-section">
                <h1 style={{marginTop: 0}}>MapStore</h1>
                <p>
                    <I18N.Message msgId="about_p0-0"/>
                </p>
                <p><I18N.Message msgId="about_p1"/> <a href="https://docs.mapstore.geosolutionsgroup.com/en/latest/"><I18N.Message msgId="about_a0"/></a>  </p>
                <h2><I18N.Message msgId="about_h20"/></h2>
                <p>
                    <I18N.Message msgId="about_p3"/>
                </p>
                <p><I18N.Message msgId="about_p5-0"/> <a href="https://github.com/geosolutions-it/MapStore2/wiki#community-bylaws"><I18N.Message msgId="about_a1"/></a></p>
            </div>);
    }
}

export default About;
