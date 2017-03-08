/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const Message = require('../components/I18N/Message');
const {FormGroup, FormControl, Label} = require('react-bootstrap');
const {selectTheme} = require('../actions/theme');
const ThemeSwitcher = React.createClass({
    propTypes: {
        themes: React.PropTypes.array,
        selectedTheme: React.PropTypes.object,
        defaultSelectedTheme: React.PropTypes.string,
        onThemeSelected: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            onThemeSelected: () => {},
            themes: [{
                    id: "default"
                }, {
                    id: "console"
                }, {
                    id: "wasabi"
                }, {
                    id: "dark"
                }, {
                    id: "geosolutions"
            }],
            defaultSelectedTheme: "default"
        };
    },

    onChangeTheme(themeId) {
        let theme = this.props.themes.reduce((prev, curr) => curr.id === themeId ? curr : prev);
        let link = document.getElementById('theme_stylesheet');
        if (link) {
            let basePath = link.href && link.href.substring(0, link.href.lastIndexOf("/"));
            link.setAttribute('href', basePath + "/" + theme.id + ".css");
        }
        this.props.onThemeSelected(theme);
    },
    render() {
        return (<FormGroup className="theme-switcher" style={{ width: "300px", margin: "20px auto"}} bsSize="small">
                <Label><Message msgId="manager.theme_combo"/></Label>
                <FormControl
                    value={ (this.props.selectedTheme && this.props.selectedTheme.id) || this.props.defaultSelectedTheme}
                    componentClass="select" ref="mapType" onChange={(e) => this.onChangeTheme(e.target.value)}>
                    {this.props.themes.map( (t) => <option key={t.id} value={t.id}>{t.label || t.id}</option>)}
                </FormControl>
            </FormGroup>);
    }
});

const ThemeSwitcherPlugin = connect((s) => ({
    selectedTheme: s && s.theme && s.theme.selectedTheme
}), {
    onThemeSelected: selectTheme
})(ThemeSwitcher);

module.exports = {
    ThemeSwitcherPlugin: ThemeSwitcherPlugin,
    reducers: {
        theme: require('../reducers/theme')
    }
};
