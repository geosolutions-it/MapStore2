/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

require('./css/previewlist.css');

const PreviewList = React.createClass({
    propTypes: {
        width: React.PropTypes.number,
        uid: React.PropTypes.number
    },
    getDefaultProps() {
        return {
            width: 0,
            uid: 0
        };
    },
    render() {
        const {width, uid} = this.props;
        console.log(this.props.children);
        return (
            <div className="background-preview-vertical-list" style={{width, left: (width + 5) * uid, height: 55 }}>
            </div>
        );
    }
});

module.exports = PreviewList;
