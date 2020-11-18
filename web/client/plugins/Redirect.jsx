/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import assign from 'object-assign';
import { connect } from 'react-redux';

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

/**
 * Utility plugin to redirect not logged users to the home page.
 * @name Redirect
 * @class
 * @memberof plugins
 */
export default {
    RedirectPlugin: assign(Redirect, {}
    )};
