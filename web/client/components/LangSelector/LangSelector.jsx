
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var BootstrapReact = require('react-bootstrap');
var Input = BootstrapReact.Input;

var I18NStore = require('../../stores/I18NStore');
var I18NActions = require('../../actions/I18NActions');

var LangSelector = React.createClass({
    propTypes: {
        locales: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            locales: I18NStore.getSupportedLocales()
        };
    },
    render() {
        var val;
        var label;
        var list = [];
        for (let lang in this.props.locales) {
            if (this.props.locales.hasOwnProperty(lang)) {
                val = this.props.locales[lang];
                label = lang;
                list.push(<option value={val} key={val}>{label}</option>);
            }
        }
        return (
            <Input type="select" bsSize="small" onChange={this.launchNewLangAction}>
                {list}
            </Input>
        );
    },
    launchNewLangAction() {
        var element = React.findDOMNode(this);
        var selectNode = element.getElementsByTagName('select').item(0);
        I18NActions.launch(I18NActions.CHANGE_LANG, {locale: selectNode.value});
    }
});

module.exports = LangSelector;
