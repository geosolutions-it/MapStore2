/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isFunction } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {
    Glyphicon,
    ListGroupItem,
    Tooltip
} from 'react-bootstrap';

import I18N from '../I18N/I18N';
import OverlayTrigger from '../misc/OverlayTrigger';
import Button from '../misc/Button';

class MapItem extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        mapType: PropTypes.string
    };

    renderButtons = () => {
        if (this.props.viewerUrl) {
            let button = isFunction(this.props.viewerUrl) ?
                <Button bsStyle="info" onClick={() => this.props.viewerUrl(this.props.map)}> <Glyphicon glyph={"new-window"}/></Button> :
                <Button bsStyle="info" target="_blank" href={this.props.viewerUrl + "?type=" + this.props.mapType + "&mapId=" + this.props.map.id}> <Glyphicon glyph={"new-window"}/></Button>;
            const tooltip = <Tooltip id="manager.openInANewTab"><I18N.Message msgId="manager.openInANewTab" /></Tooltip>;
            return (<span style={{display: "block"}}>
                <OverlayTrigger placement="right" overlay={tooltip}>
                    {button}
                </OverlayTrigger>
            </span>);
        }
        return "";
    };

    render() {
        return (
            <ListGroupItem header={this.props.map.name}>{this.props.map.description} {this.renderButtons()}</ListGroupItem>
        );
    }
}

export default MapItem;
