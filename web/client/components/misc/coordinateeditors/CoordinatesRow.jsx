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
const {isEqual, isNumber} = require('lodash');
const DropdownToolbarOptions = require('../toolbar/DropdownToolbarOptions');

class CoordinatesRow extends React.Component {
    static propTypes = {
        idx: PropTypes.number,
        component: PropTypes.object,
        onRemove: PropTypes.func,
        onSubmit: PropTypes.func,
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

    static defaultProps = {
        showLabels: false,
        formatVisible: false,
        onMouseEnter: () => {},
        onMouseLeave: () => {}
    };

    constructor(props) {
        super(props);
        this.state = {
            lat: isNumber(this.props.component.lat) ? this.props.component.lat : "",
            lon: isNumber(this.props.component.lon) ? this.props.component.lon : "",
            disabledApplyChange: true
        };
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (!isEqual(newProps.component, this.props.component)) {
            const lat = isNumber(newProps.component.lat) ? newProps.component.lat : "";
            const lon = isNumber(newProps.component.lon) ? newProps.component.lon : "";
            this.setState({lat, lon, disabledApplyChange: true});
        }
    }

    onChangeLatLon = (coord, val) => {
        this.setState({...this.state, [coord]: parseFloat(val)}, ()=>{
            const changeLat = parseFloat(this.state.lat) !== parseFloat(this.props.component.lat);
            const changeLon = parseFloat(this.state.lon) !== parseFloat(this.props.component.lon);
            this.setState({...this.state, disabledApplyChange: !(changeLat || changeLon)});
        });
    };

    onSubmit = () => {
        this.props.onSubmit(this.props.idx, this.state);
    };

    render() {
        const {idx} = this.props;
        const rowStyle = {marginLeft: -5, marginRight: -5};
        // drag button must be a button in order to show the disabled state
        const toolButtons = [
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
                    title: <Glyphicon glyph="cog"/>,
                    className: "square-button-md no-border",
                    pullRight: true,
                    tooltipId: "identifyChangeCoordinateFormat"
                },
                menuOptions: [
                    {
                        active: this.props.format === "decimal",
                        onClick: () => { this.props.onChangeFormat("decimal"); },
                        text: <Message msgId="search.decimal"/>
                    }, {
                        active: this.props.format === "aeronautical",
                        onClick: () => { this.props.onChangeFormat("aeronautical"); },
                        text: <Message msgId="search.aeronautical"/>
                    }
                ],
                visible: this.props.formatVisible,
                Element: DropdownToolbarOptions
            },
            {
                glyph: "ok",
                disabled: this.state.disabledApplyChange,
                tooltipId: 'identifyCoordinateApplyChanges',
                onClick: this.onSubmit
            }
        ];
        const dragButton = (
            <div><Button
                disabled={!this.props.isDraggableEnabled}
                className="square-button-md no-border btn btn-default"
                style={{display: "flex", cursor: this.props.isDraggableEnabled && 'grab'}}>
                <Glyphicon
                    glyph="menu-hamburger"
                    style={{pointerEvents: !this.props.isDraggableEnabled ? "none" : "auto"}}
                />
            </Button></div>);

        return (
            <Row className={`coordinateRow ${this.props.format || ""} ${this.props.customClassName || ""}`} style={!this.props.customClassName ? rowStyle : {}} onMouseEnter={() => {
                if (this.props.onMouseEnter && this.props.component.lat && this.props.component.lon) {
                    this.props.onMouseEnter(this.props.component);
                }
            }} onMouseLeave={() => {
                if (this.props.onMouseLeave && this.props.component.lat && this.props.component.lon) {
                    this.props.onMouseLeave();
                }
            }}>
                <Col xs md={1}>
                    {this.props.showDraggable ? this.props.isDraggable ? this.props.connectDragSource(dragButton) : dragButton : null}
                </Col>
                <div className="coordinate lat" style={{width: "100%"}}>
                    <Col xs md={4}>
                        {this.props.showLabels && <div><Message msgId="latitude"/></div>}
                        <CoordinateEntry
                            format={this.props.format}
                            aeronauticalOptions={this.props.aeronauticalOptions}
                            coordinate="lat"
                            idx={idx}
                            value={this.state.lat}
                            onChange={(dd) => this.onChangeLatLon("lat", dd)}
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
                            onKeyDown={this.onSubmit}
                        />
                    </Col>
                </div>
                <div className="coordinate lon" style={{width: "100%"}}>
                    <Col xs md={4}>
                        {this.props.showLabels && <div><Message msgId="longitude"/></div>}
                        <CoordinateEntry
                            format={this.props.format}
                            aeronauticalOptions={this.props.aeronauticalOptions}
                            coordinate="lon"
                            idx={idx}
                            value={this.state.lon}
                            onChange={(dd) => this.onChangeLatLon("lon", dd)}
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
                            onKeyDown={this.onSubmit}
                        />
                    </Col>
                </div>
                <Col key="tools" xs md={3}>
                    <Toolbar
                        btnGroupProps={{ className: 'tools' }}
                        btnDefaultProps={{ className: 'square-button-md no-border'}}
                        buttons={toolButtons}/>
                </Col>
            </Row>
        );
    }
}

module.exports = draggableComponent(CoordinatesRow);
