/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const { get, isNil } = require('lodash');
const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const { loadDashboard, resetDashboard } = require('../../actions/dashboard');
const { checkLoggedUser } = require('../../actions/security');

const Page = require('../../containers/Page');
const BorderLayout = require('../../components/layout/BorderLayout');

class DashboardPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadResource: PropTypes.func,
        checkLoggedUser: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        name: "dashboard",
        mode: 'desktop',
        reset: () => {},
        checkLoggedUser: () => {}
    };

    UNSAFE_componentWillMount() {
        const id = get(this.props, "match.params.did");
        if (id) {
            this.props.reset();
            this.props.loadResource(id);
        } else {
            this.props.reset();
            this.props.checkLoggedUser();
        }
    }
    componentDidUpdate(oldProps) {
        const id = get(this.props, "match.params.did");
        if (get(oldProps, "match.params.did") !== get(this.props, "match.params.did")) {
            if (isNil(id)) {
                this.props.reset();
            } else {
                this.props.loadResource(id);
            }
        }
    }
    componentWillUnmount() {
        this.props.reset();
    }
    render() {
        return (<Page
            id="dashboard"
            component={BorderLayout}
            includeCommon={false}
            plugins={this.props.plugins}
            params={this.props.match.params}
        />);
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    checkLoggedUser,
    loadResource: loadDashboard,
    reset: resetDashboard
})(DashboardPage);
