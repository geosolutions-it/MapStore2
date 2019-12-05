/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {Row, Col, Glyphicon, Button} = require('react-bootstrap');
const Toolbar = require('../toolbar/Toolbar');
const draggableComponent = require('../enhancers/draggableComponent');
const CoordinateEntry = require('./CoordinateEntry');
const Message = require('../../I18N/Message');
const DropdownToolbarOptions = require('../toolbar/DropdownToolbarOptions');

class CoordinatesRow extends React.Component {
    static propTypes = {
        idx: PropTypes.number,
        component: PropTypes.object,
        onRemove: PropTypes.func,
        onChange: PropTypes.func,
        onChangeFormat: PropTypes.func,
        onMouseEnter: PropTypes.func,
        format: PropTypes.string,
        type: PropTypes.string,
        onMouseLeave: PropTypes.func,
        connectDragSource: PropTypes.func,
        aeronauticalOptions: PropTypes.object,
        customClassName: PropTypes.string,
        isDraggable: PropTypes.bool,
        isDraggableEnabled: PropTypes.bool,
        showLabels: PropTypes.bool,
        showDraggable: PropTypes.bool,
        removeVisible: PropTypes.bool,
        formatVisible: PropTypes.bool,
        removeEnabled: PropTypes.bool
    };
    defaultProps = {
        showLabels: false,
        formatVisible: false,
        onMouseEnter: () => {},
        onMouseLeave: () => {}
    }

    render() {
        const { idx } = this.props;
        const rowStyle = { marginLeft: -5, marginRight: -5 };
        // drag button must be a button in order to show the disabled state
        const dragButton = (
            <div><Button
                disabled={!this.props.isDraggableEnabled}
                className="square-button-md no-border btn btn-default"
                style={{ display: "flex", cursor: this.props.isDraggableEnabled && 'grab' }}>
                <Glyphicon
                    glyph="menu-hamburger"
                    style={{ pointerEvents: !this.props.isDraggableEnabled ? "none" : "auto" }}
                />
            </Button></div>);

        return (
            <Row className={`coordinateRow ${this.props.customClassName || ""}`} style={!this.props.customClassName ? rowStyle : {}} onMouseEnter={() => {
                if (this.props.onMouseEnter && this.props.component.lat && this.props.component.lon) {
                    this.props.onMouseEnter(this.props.component);
                }
            }} onMouseLeave={() => {
                if (this.props.onMouseLeave && this.props.component.lat && this.props.component.lon) {
                    this.props.onMouseLeave();
                }
            }}>
                <Col xs={1}>
                    {this.props.showDraggable ? this.props.isDraggable ? this.props.connectDragSource(dragButton) : dragButton : null}
                </Col>
                <Col xs={10}>
                    <div className="coordinates">
                        <div>
                            {this.props.showLabels && <span><Message msgId="latitude" /></span>}
                            <CoordinateEntry
                                format={this.props.format}
                                aeronauticalOptions={this.props.aeronauticalOptions}
                                coordinate="lat"
                                idx={idx}
                                value={this.props.component.lat}
                                onChange={(dd) => this.props.onChange(idx, "lat", dd)}
                                constraints={{
                                    decimal: {
                                        lat: {
                                            min: -90,
                                            max: 90
                                        },
                                        lon: {
                                            min: -180,
                                            max: 180
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div>
                            {this.props.showLabels && <span><Message msgId="longitude" /></span>}
                            <CoordinateEntry
                                format={this.props.format}
                                aeronauticalOptions={this.props.aeronauticalOptions}
                                coordinate="lon"
                                idx={idx}
                                value={this.props.component.lon}
                                onChange={(dd) => this.props.onChange(idx, "lon", dd)}
                                constraints={{
                                    decimal: {
                                        lat: {
                                            min: -90,
                                            max: 90
                                        },
                                        lon: {
                                            min: -180,
                                            max: 180
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </Col>
                <Col xs={1}>
                    <Toolbar
                        btnGroupProps={{ className: 'pull-right' }}
                        btnDefaultProps={{ className: 'square-button-md no-border' }}
                        buttons={
                            [
                                {
                                    visible: this.props.removeVisible,
                                    disabled: !this.props.removeEnabled,
                                    glyph: 'trash',
                                    onClick: () => {
                                        this.props.onRemove(idx);
                                    }
                                },
                                {
                                    buttonConfig: {
                                        title: <Glyphicon glyph="cog" />,
                                        className: "square-button-md no-border",
                                        pullRight: true
                                    },
                                    menuOptions: [
                                        {
                                            active: this.props.format === "decimal",
                                            onClick: () => { this.props.onChangeFormat("decimal"); },
                                            text: <Message msgId="search.decimal" />
                                        }, {
                                            active: this.props.format === "aeronautical",
                                            onClick: () => { this.props.onChangeFormat("aeronautical"); },
                                            text: <Message msgId="search.aeronautical" />
                                        }
                                    ],
                                    visible: this.props.formatVisible,
                                    Element: DropdownToolbarOptions
                                }
                            ]
                        } />
                </Col>
            </Row>
        );
    }
}

module.exports = draggableComponent(CoordinatesRow);
