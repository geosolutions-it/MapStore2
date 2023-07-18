/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import get from "lodash/get";

import Page from "../../containers/Page";
import { loadPermalink } from '../../actions/permalink';

/**
 * @name Peramlink
 * @memberof pages
 * @class
 * @classdesc
 * This is the main container page for permalink.
 */
class Permalink extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        reset: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func,
        loadResource: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        mode: "desktop",
        reset: () => {}
    };

    state = {};

    onLoaded = (pluginsAreLoaded) => {
        if (pluginsAreLoaded && !this.state.pluginsAreLoaded) {
            this.setState({ pluginsAreLoaded: true }, () => {
                const id = get(this.props, "match.params.pid");
                if (id) {
                    this.props.loadResource(id);
                }
            });
        }
    };

    render() {
        return (
            <Page
                id="permalink"
                className="permalink"
                onLoaded={this.onLoaded}
                plugins={this.props.plugins}
                params={this.props.match.params}
                loaderComponent={this.props.loaderComponent}
            />
        );
    }
}

export default connect((state) => {
    return {
        mode: "desktop",
        messages: (state.locale && state.locale.messages) || {}
    };
}, {
    loadResource: loadPermalink
})(Permalink);
