/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const PropTypes = require('prop-types');
const Debug = require('../development/Debug');
const {Route} = require('react-router');
const {ConnectedRouter} = require('react-router-redux');
const createHistory = require('history/createHashHistory').default;
const history = createHistory();


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
        themeCfg: PropTypes.object,
        version: PropTypes.string
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
    state = {
        renderChildren: false
    }
    renderPages = () => {
        return this.props.pages.map((page, i) => {
            const pageConfig = page.pageConfig || {};
            const Component = connect(() => ({
                plugins: this.props.plugins,
                ...pageConfig
            }))(page.component);
            return <Route key={(page.name || page.path) + i} exact path={page.path} component={Component}/>;
        });
    };

    render() {
        return (

            <div className={this.props.className}>
                <Theme {...this.props.themeCfg} version={this.props.version} onLoad={this.loaded}>
                    {this.state.renderChildren ? (<Localized messages={this.props.locale.messages} locale={this.props.locale.current} loadingError={this.props.locale.localeError}>
                        <ConnectedRouter history={history}>
                            <div>
                                {this.renderPages()}
                            </div>
                        </ConnectedRouter>
                    </Localized>) : (<span><div className="_ms2_init_spinner _ms2_init_center"><div></div></div>
                    <div className="_ms2_init_text _ms2_init_center">Loading</div></span>)}
                </Theme>
                <Debug/>
            </div>
        );
    }
    loaded = () => {
        this.setState({
            renderChildren: true
        });
    }
}

module.exports = StandardRouter;
