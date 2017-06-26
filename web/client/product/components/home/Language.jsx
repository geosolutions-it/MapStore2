var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var I18N = require('../../../components/I18N/I18N');
var LangSelector = require('../../../components/I18N/LangSelector');

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

module.exports = Language;
