var PropTypes = require('prop-types');
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
var aboutImg = require('../../../assets/img/Blank.gif');

class About extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        modalConfig: PropTypes.object
    };

    static defaultProps = {
        style: {
            position: "absolute",
            zIndex: 1000,
            bottom: "-8px",
            right: "0px",
            margin: "8px"
        },
        modalConfig: {
            closeGlyph: "1-close"
        }
    };

    render() {
        return (<InfoButton
            {...this.props.modalConfig}
            image={aboutImg}
            title={<I18N.Message msgId="about_title"/>}
            btnType="image"
            className="map-logo"
            body={
                <AboutContent />
            }/>);
    }
}

module.exports = About;
