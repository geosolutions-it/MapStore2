/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {connect} = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const PluginsContainer = connect((state) => ({
    mode: urlQuery.mode || ((urlQuery.mobile || (state.browser && state.browser.mobile)) ? 'mobile' : 'desktop')
}))(require('../components/plugins/PluginsContainer'));

const Page = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        pagePluginsConfig: React.PropTypes.object,
        pluginsConfig: React.PropTypes.object,
        params: React.PropTypes.object,
        onMount: React.PropTypes.func,
        plugins: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            mode: 'desktop',
            pagePluginsConfig: {
                desktop: [],
                mobile: []
            },
            pluginsConfig: {
                desktop: [],
                mobile: []
            },
            onMount: () => {}
        };
    },
    componentWillMount() {
        this.props.onMount();
    },
    render() {
        let pluginsConfig = {
            desktop: [...(this.props.pagePluginsConfig.desktop).filter((tool) => !this.isBottom(tool)), ...this.props.pluginsConfig.desktop, ...(this.props.pagePluginsConfig.desktop).filter(this.isBottom)],
            mobile: [...(this.props.pagePluginsConfig.mobile).filter((tool) => !this.isBottom(tool)), ...this.props.pluginsConfig.mobile, ...(this.props.pagePluginsConfig.desktop).filter(this.isBottom)]
        };
        return (<PluginsContainer key="{this.props.id}" id={"page-" + this.props.id} className={"page page-" + this.props.id}
            pluginsConfig={pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.params}
            />);
    },
    isBottom(tool) {
        if ( tool.cfg ) {
            return tool.cfg.bottom;
        }
        return false;
    }
});

module.exports = Page;
