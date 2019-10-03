/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const src = require("../product/plugins/attribution/geosolutions-brand.png");
const {connect} = require('react-redux');

class RulesManagerFooter extends React.Component {

    static propTypes = {
        loading: PropTypes.bool,
        containerPosition: PropTypes.string
    };

    static defaultProps = {
        loading: false,
        containerPosition: "footer"
    };

    render() {
        return (
            <div className="mapstore-footer">
                <div style={{'float': "left"}}>
                    <div className={this.props.loading ? 'ms-circle-loader-md' : ''}></div>
                </div>
                <div className="m-center">
                </div>
                <div style={{'float': "rigth"}}>
                    <div className="ms-logo-geosolutions">
                        <img src={src}/>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    RulesManagerFooterPlugin: connect(({rulesmanager}) => ({loading: rulesmanager.loading}))(RulesManagerFooter),
    reducers: {}
};
