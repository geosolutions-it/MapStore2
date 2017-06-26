const PropTypes = require('prop-types');
/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {head} = require('lodash');
const {FormGroup, Label, FormControl} = require('react-bootstrap');
const Message = require('../I18N/Message');

class ThemeSwitcher extends React.Component {
    static propTypes = {
        themes: PropTypes.array,
        selectedTheme: PropTypes.object,
        onThemeSelected: PropTypes.func,
        style: PropTypes.object
    };

    static defaultProps = {
        onThemeSelected: () => {},
        style: {}
    };

    onChangeTheme = (themeId) => {
        const theme = head(this.props.themes.filter((t) => t.id === themeId));
        this.props.onThemeSelected(theme);
    };

    render() {
        return (
            <FormGroup className="theme-switcher" style={this.props.style} bsSize="small">
                <Label><Message msgId="manager.theme_combo"/></Label>
                <FormControl
                    value={this.props.selectedTheme && this.props.selectedTheme.id}
                    componentClass="select" ref="mapType" onChange={(e) => this.onChangeTheme(e.target.value)}>
                    {this.props.themes.map( (t) => <option key={t.id} value={t.id}>{t.label || t.id}</option>)}
                </FormControl>
            </FormGroup>);
    }
}

module.exports = ThemeSwitcher;
