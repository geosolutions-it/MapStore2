/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import SharingLink from './SharingLink';
import Message from '../../I18N/Message';
import { Glyphicon } from 'react-bootstrap';
import Button from '../../misc/Button';
import { ControlledPopover } from '../../styleeditor/Popover';
import FlexBox from '../../layout/FlexBox';

class SharingLinks extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false };
    }

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
        const sharingLinks = links.map((link) => <SharingLink key={link.url + link.labelId} url={link.url} labelId={link.labelId} {...other}/>);
        const content = (
            <FlexBox
                column
                classNames={['shadow-md', 'ms-main-colors', '_relative', '_padding-tb-xs', '_padding-lr-md']}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
            >
                <h5><Message msgId="catalog.share"/></h5>
                {sharingLinks}
            </FlexBox>
        );
        return (
            <ControlledPopover
                placement="top"
                content={content}
                open={this.state.open}
                onOpen={(open) => this.setState({ open })}
            >
                <Button
                    bsSize={buttonSize}
                    className="square-button"
                >
                    <Glyphicon glyph="link"/>
                </Button>
            </ControlledPopover>
        );
    }
}

export default SharingLinks;
