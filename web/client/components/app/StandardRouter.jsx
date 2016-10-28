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
const PluginsUtils = require('../../utils/PluginsUtils');

const StandardRouter = React.createClass({
    propTypes: {
        plugins: React.PropTypes.object,
        locale: React.PropTypes.object,
        pages: React.PropTypes.array,
        loadPlugins: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            plugins: {},
            locale: {messages: {}, current: ''},
            pages: [],
            loadPlugins: () => {}
        };
    },
    getInitialState() {
        return {plugins: {}};
    },
    renderPages() {
        return this.props.pages.map((page) => {
            const pageConfig = page.pageConfig || {};
            const Component = connect(() => ({
                plugins: assign({}, this.props.plugins, this.state.plugins),
                ...pageConfig
            }))(page.component);
            return (<Route key={page.name || page.path} path={page.path} component={Component} onEnter={page.plugins ? (nextState, replace, callback) => {
                page.plugins((newPlugins) => {
                    this.setState({
                        plugins: assign({}, this.state.plugins, PluginsUtils.getPlugins(newPlugins))
                    });
                    this.props.loadPlugins(newPlugins);
                    callback();
                });
            } : null}/>);
        });
    },
    render() {
        return (

            <div className="fill">
                <Localized messages={this.props.locale.messages} locale={this.props.locale.current} loadingError={this.props.locale.localeError}>
                    <Router history={hashHistory}>
                        {this.renderPages()}
                    </Router>
                </Localized>
                <Debug/>
            </div>
        );
    }
});

module.exports = StandardRouter;
