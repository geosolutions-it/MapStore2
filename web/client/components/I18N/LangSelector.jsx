
var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {FormControl} = require('react-bootstrap');
var LocaleUtils = require('../../utils/LocaleUtils');

class LangSelector extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        locales: PropTypes.object,
        currentLocale: PropTypes.string,
        onLanguageChange: PropTypes.func
    };

    static defaultProps = {
        id: "mapstore-langselector",
        locales: {},
        currentLocale: 'en-US',
        onLanguageChange: function() {}
    };

    render() {
        var val;
        var label;
        var list = [];
        let locales = LocaleUtils.getSupportedLocales();
        for (let lang in locales) {
            if (locales.hasOwnProperty(lang)) {
                val = locales[lang].code;
                label = locales[lang].description;
                list.push(<option value={val} key={val}>{label}</option>);
            }
        }
        return (
            <FormControl id={this.props.id} value={this.props.currentLocale} componentClass="select" bsSize="small" onChange={this.launchNewLangAction}>
                {list}
            </FormControl>
        );
    }

    launchNewLangAction = (e) => {
        this.props.onLanguageChange(e.target.value);
    };
}

module.exports = LangSelector;
