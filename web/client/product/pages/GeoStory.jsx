/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get, isNil } from 'lodash';
import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;

import Page from '../../containers/Page';
import {loadGeostory} from '../../actions/geostory';
import BorderLayout from '../../components/layout/BorderLayout';
import { removeQueryFromUrl } from '../../utils/ShareUtils';

class GeoStoryPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadResource: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object,
        isAuth: PropTypes.bool,
        location: PropTypes.object,
        history: PropTypes.object
    };

    static defaultProps = {
        name: "geostory",
        mode: 'desktop',
        reset: () => { }
    };

    componentWillMount() {
        this.redirectAuth();
        const id = get(this.props, "match.params.gid");
        this.props.reset();
        this.props.loadResource(id);
    }
    componentDidUpdate(oldProps) {
        const id = get(this.props, "match.params.gid");
        const oldId = get(oldProps, "match.params.gid");
        if (oldId !== id) {
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
            id="geostory"
            component={BorderLayout}
            includeCommon={false}
            plugins={this.props.plugins}
            params={this.props.match.params}
        />);
    }

    redirectAuth = () => {
        const { pathname } = this.props.location;
        if (this.props.isAuth && pathname.includes('/geostory/shared')) {
            const newUrl = removeQueryFromUrl(pathname.replace('/geostory/shared', '/geostory'));
            this.props.history.push(newUrl);
        }
    }
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop',
    isAuth: state.security.user
}),
{
    loadResource: loadGeostory
    // reset: resetGeostory
})(GeoStoryPage);
