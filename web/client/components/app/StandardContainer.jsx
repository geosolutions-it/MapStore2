/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Debug from '../development/Debug';
import Localized from '../I18N/Localized';
import ThemeComp from '../theme/Theme';

const Theme = connect((state) => ({
    theme: state.theme && state.theme.selectedTheme && state.theme.selectedTheme.id
}), {}, (stateProps, dispatchProps, ownProps) => {
    return assign({}, stateProps, dispatchProps, ownProps);
})(ThemeComp);

class StandardContainer extends React.Component {
    static propTypes = {
        plugins: PropTypes.object,
        locale: PropTypes.object,
        componentConfig: PropTypes.object,
        className: PropTypes.string,
        themeCfg: PropTypes.object,
        version: PropTypes.string,
        loadAfterTheme: PropTypes.bool
    };

    static defaultProps = {
        plugins: {},
        locale: {messages: {}, current: 'en-US'},
        className: "fill",
        themeCfg: {
            path: 'dist/themes'
        },
        loadAfterTheme: false
    };
    state = {
        themeLoaded: false
    }
    renderComponent = () => {
        const {componentConfig} = this.props;
        if (!componentConfig) {
            return null;
        }
        const Component = componentConfig.component;
        const config = componentConfig.config || {};
        return (<Component {...config} plugins={this.props.plugins}/>);
    };

    renderAfterTheme() {
        return (
            <div className={this.props.className}>
                <Theme {...this.props.themeCfg} version={this.props.version} onLoad={this.themeLoaded}>
                    {this.state.themeLoaded ? (<Localized messages={this.props.locale.messages} locale={this.props.locale.current} loadingError={this.props.locale.localeError}>
                        {this.renderComponent()}
                    </Localized>) :
                        (<span><div className="_ms2_init_spinner _ms2_init_center"><div></div></div>
                            <div className="_ms2_init_text _ms2_init_center">Loading CoreSpatial Portal</div></span>)}
                </Theme>
                <Debug/>
            </div>
        );
    }
    renderWithTheme() {
        return (
            <div className={this.props.className}>
                <Theme {...this.props.themeCfg} version={this.props.version}/>
                <Localized messages={this.props.locale.messages} locale={this.props.locale.current} loadingError={this.props.locale.localeError}>
                    {this.renderComponent()}
                </Localized>
                <Debug/>
            </div>);
    }
    render() {
        return this.props.loadAfterTheme ? this.renderAfterTheme() : this.renderWithTheme();
    }
    themeLoaded = () => {
        this.setState({
            themeLoaded: true
        });
    }
}

export default StandardContainer;
