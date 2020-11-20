/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import PropTypes from 'prop-types';

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
export default MoreDetails;
