/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';

import I18N from '../../../components/I18N/I18N';
import LangSelector from '../../../components/I18N/LangSelector';

class Language extends React.Component {
    static propTypes = {
        locale: PropTypes.string,
        onChange: PropTypes.func
    };

    render() {
        return (<div id="langSelContainer" key="langSelContainer" >
            <I18N.Message msgId="Language" />: <LangSelector currentLocale={this.props.locale} onLanguageChange={this.props.onChange}/>
        </div>);
    }
}

export default Language;
