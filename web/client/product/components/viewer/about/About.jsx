/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var InfoButton = require('../../../../components/buttons/InfoButton');
var AboutContent = require('./AboutContent');
var I18N = require('../../../../components/I18N/I18N');
var aboutImg = require('../../../assets/img/mapstore-about.png');

var About = React.createClass({
    propTypes: {
        style: React.PropTypes.object
    },
    render() {
        return (<InfoButton
            image={aboutImg}
            title={<I18N.Message msgId="about_title"/>}
            btnType="image"
            style={this.props.style}
            body={
                <AboutContent />
            }/>);
    }
});

module.exports = About;
