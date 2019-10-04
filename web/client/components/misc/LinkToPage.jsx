const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Button} = require('react-bootstrap');

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

module.exports = LinkToPage;
