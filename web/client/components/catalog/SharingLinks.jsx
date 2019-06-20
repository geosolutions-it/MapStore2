/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');

const SharingLink = require('./SharingLink');
const Message = require('../I18N/Message');

const {Popover, Button, Glyphicon} = require('react-bootstrap');

const OverlayTrigger = require('../misc/OverlayTrigger');

class SharingLinks extends React.Component {
    static propTypes = {
        links: PropTypes.array,
        onCopy: PropTypes.func,
        messages: PropTypes.object,
        locale: PropTypes.string,
        buttonSize: PropTypes.string,
        popoverContainer: PropTypes.object,
        addAuthentication: PropTypes.bool
    };

    render() {
        if (!this.props.links || this.props.links.length === 0) {
            return null;
        }
        const {links, buttonSize, ...other} = this.props;
        const sharingLinks = links.map((link, index) => <SharingLink key={index} url={link.url} labelId={link.labelId} {...other}/>);
        const popover = (<Popover className="links-popover" id="links-popover">
            <h5><Message msgId="catalog.share"/></h5>
            {sharingLinks}
        </Popover>);
        return (
            <OverlayTrigger container={this.props.popoverContainer} positionLeft={150} placement="top" trigger="click" overlay={popover}>
                <Button bsSize={buttonSize} className="square-button-md" bsStyle="primary">
                    <Glyphicon glyph="link"/>
                </Button>
            </OverlayTrigger>
        );
    }
}

module.exports = SharingLinks;
