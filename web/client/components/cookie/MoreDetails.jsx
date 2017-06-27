/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');

/**
  * More Details cookie page. Page with complete description about cookies used in the application.
  * @class MoreDetails
  * @memberof components.Cookies
  *
  */
class MoreDetails extends React.Component {
    static propTypes = {
        html: PropTypes.string
    };
    static contextTypes = {};
    static defaultProps = {};

    render() {
        return <div className="cookie-seeMore" dangerouslySetInnerHTML={{__html: this.props.html} } />;
    }
}
module.exports = MoreDetails;
