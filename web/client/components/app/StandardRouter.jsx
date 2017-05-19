const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const Debug = require('../development/Debug');

const {Router, Route, hashHistory} = require('react-router');

const Localized = require('../I18N/Localized');

const assign = require('object-assign');

const Theme = connect((state) => ({
    theme: state.theme && state.theme.selectedTheme && state.theme.selectedTheme.id
}), {}, (stateProps, dispatchProps, ownProps) => {
    return assign({}, stateProps, dispatchProps, ownProps);
})(require('../theme/Theme'));

class StandardRouter extends React.Component {
    static propTypes = {
        plugins: PropTypes.object,
        locale: PropTypes.object,
        pages: PropTypes.array,
        className: PropTypes.string,
        themeCfg: PropTypes.object
    };

    static defaultProps = {
        plugins: {},
        locale: {messages: {}, current: 'en-US'},
        pages: [],
        className: "fill",
        themeCfg: {
            path: 'dist/themes'
        }
    };

    renderPages = () => {
        return this.props.pages.map((page) => {
            const pageConfig = page.pageConfig || {};
            const Component = connect(() => ({
                plugins: this.props.plugins,
                ...pageConfig
            }))(page.component);
            return <Route key={page.name || page.path} path={page.path} component={Component}/>;
        });
    };

    render() {
        return (

            <div className={this.props.className}>
                <Theme {...this.props.themeCfg}/>
                <Localized messages={this.props.locale.messages} locale={this.props.locale.current} loadingError={this.props.locale.localeError}>
                    <Router history={hashHistory}>
                        {this.renderPages()}
                    </Router>
                </Localized>
                <Debug/>
            </div>
        );
    }
}

module.exports = StandardRouter;
