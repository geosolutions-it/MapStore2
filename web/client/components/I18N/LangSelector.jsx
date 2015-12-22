
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var BootstrapReact = require('react-bootstrap');
var Input = BootstrapReact.Input;
var LocaleUtils = require('../../utils/LocaleUtils');

var LangSelector = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        locales: React.PropTypes.object,
        currentLocale: React.PropTypes.string,
        onLanguageChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            id: "mapstore-langselector",
            locales: LocaleUtils.getSupportedLocales(),
            currentLocale: 'en-US',
            onLanguageChange: function() {}
        };
    },
    render() {
        var val;
        var label;
        var list = [];
        for (let lang in this.props.locales) {
            if (this.props.locales.hasOwnProperty(lang)) {
                val = this.props.locales[lang].code;
                label = this.props.locales[lang].description;
                list.push(<option value={val} key={val}>{label}</option>);
            }
        }
        return (
                <Input id={this.props.id} value={this.props.currentLocale} type="select" bsSize="small" onChange={this.launchNewLangAction}>
                    {list}
                </Input>
        );
    },
    launchNewLangAction() {
        var element = ReactDOM.findDOMNode(this);
        var selectNode = element.getElementsByTagName('select').item(0);
        this.props.onLanguageChange(selectNode.value);
    }
});

module.exports = LangSelector;
