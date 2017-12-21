/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Glyphicon, Tooltip, OverlayTrigger, Button, FormGroup } = require('react-bootstrap');
const Message = require('../../I18N/Message');

const PropTypes = require('prop-types');

class ZoomToAnnotation extends React.Component {
    static propTypes = {
        annotation: PropTypes.object,
        maxZoom: PropTypes.number,
        onZoom: PropTypes.func
    };

    static defaultProps = {
        maxZoom: 18
    };

    state = { copied: false };

    render() {
        const tooltip = (<Tooltip placement="bottom" className="in" id="tooltip-bottom" style={{ zIndex: 2001 }}>
            <Message msgId="annotations.zoomToTooltip" />
        </Tooltip>);
        return (<FormGroup>
            <div className="input-group">
                <OverlayTrigger placement="bottom" overlay={tooltip}>
                    <Button bsStyle="primary" onClick={this.zoom}>
                        <Glyphicon glyph="zoom-to" /> <Message msgId="annotations.zoomTo"/>
                    </Button>
                </OverlayTrigger>
            </div>
        </FormGroup>
        );
    }

    zoom = () => {
        if (this.props.annotation.geometry.type === 'MultiPoint') {
            const extent = this.props.annotation.geometry.coordinates.reduce((previous, current) => {
                return [Math.min(previous[0], current[0]), Math.min(previous[1], current[1]), Math.max(previous[2], current[0]), Math.max(previous[3], current[1])];
            }, [180, 90, -180, -90]);
            this.props.onZoom(extent, 'EPSG:4326', this.props.maxZoom);
        } else {
            const coords = this.props.annotation.geometry.coordinates;
            this.props.onZoom([coords[0], coords[1], coords[0], coords[1]], 'EPSG:4326', this.props.maxZoom);
        }
    }
}

module.exports = ZoomToAnnotation;
