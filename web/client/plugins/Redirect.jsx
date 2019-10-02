const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const {connect} = require('react-redux');

class RedirectComponent extends React.Component {
    static propTypes = {
        userDetails: PropTypes.object
    };

    static contextTypes = {
        router: PropTypes.object
    };

    componentDidMount() {
        this.redirect(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.redirect(nextProps);
    }

    render() {
        return null;
    }

    redirect = (props) => {
        if (!props.userDetails || !props.userDetails.user) {
            this.context.router.history.push("/");
        }
    };
}

const Redirect = connect((state) => ({
    userDetails: state.security || null
}))(RedirectComponent);


module.exports = {
    RedirectPlugin: assign(Redirect, {}
    )};
