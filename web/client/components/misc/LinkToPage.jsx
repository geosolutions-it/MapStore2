
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

class LinkToPage extends React.Component {
    static propTypes = {
        params: PropTypes.object,
        url: PropTypes.string,
        txt: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        btProps: PropTypes.object
    };

    static defaultProps = {
        params: [],
        url: '',
        btProps: {},
        txt: 'Link'
    };

    render() {
        return (
            <Button bsStyle="link" href={this.buildUrl()} target="_blank" {...this.props.btProps}>
                {this.props.txt}
            </Button>
        );
    }

    buildUrl = () => {
        let urlParams = '?';
        Object.keys(this.props.params).forEach(function(p) {
            urlParams += p + "=" + this.props.params[p] + "&";
        }, this);
        return this.props.url + encodeURI(urlParams);
    };
}

export default LinkToPage;
