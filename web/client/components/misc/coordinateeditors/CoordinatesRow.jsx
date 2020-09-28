/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {Glyphicon, InputGroup} = require('react-bootstrap');
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
        showLabels: PropTypes.bool, // Remove it
        showDraggable: PropTypes.bool,
        showToolButtons: PropTypes.bool,
        removeVisible: PropTypes.bool,
        formatVisible: PropTypes.bool,
        removeEnabled: PropTypes.bool,
        renderer: PropTypes.string
    };

    static defaultProps = {
        showLabels: false, // Remove it
        formatVisible: false,
        onMouseEnter: () => {},
        onMouseLeave: () => {},
        showToolButtons: true
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
            this.setState({...this.state, disabledApplyChange: !(changeLat || changeLon)}, ()=> {
                // Auto save on coordinate change for annotations
                this.props.renderer === "annotations" &&  this.props.onSubmit(this.props.idx, this.state);
            });
        });
    };

    onSubmit = () => {
        this.props.onSubmit(this.props.idx, this.state);
    };

    render() {
        const {idx} = this.props;
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
                onClick: this.onSubmit,
                visible: this.props.renderer !== "annotations"
            }
        ];

        // drag button cannot be a button since IE/Edge doesn't support drag operation on button
        const dragButton = (
            <div role="button" className="square-button-md no-border btn btn-default"
                style={{display: "table",
                    color: !this.props.isDraggableEnabled && "#999999",
                    pointerEvents: !this.props.isDraggableEnabled ? "none" : "auto",
                    cursor: this.props.isDraggableEnabled && 'grab' }}>
                <Glyphicon
                    glyph="menu-hamburger"
                />
            </div>);

        return (
            <div className={`coordinateRow ${this.props.format || ""} ${this.props.customClassName || ""}`} onMouseEnter={() => {
                if (this.props.onMouseEnter && this.props.component.lat && this.props.component.lon) {
                    this.props.onMouseEnter(this.props.component);
                }
            }} onMouseLeave={() => {
                if (this.props.onMouseLeave && this.props.component.lat && this.props.component.lon) {
                    this.props.onMouseLeave();
                }
            }}>
                <div style={{cursor: this.props.isDraggableEnabled ? 'grab' : "not-allowed"}}>
                    {this.props.showDraggable ? this.props.isDraggable ? this.props.connectDragSource(dragButton) : dragButton : null}
                </div>
                <div className="coordinate lat">
                    <InputGroup>
                        <InputGroup.Addon><Message msgId="latitude"/></InputGroup.Addon>
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
                    </InputGroup>
                    <InputGroup>
                        <InputGroup.Addon><Message msgId="longitude"/></InputGroup.Addon>
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
                    </InputGroup>
                </div>
                {this.props.showToolButtons && <div key="tools">
                    <Toolbar
                        btnGroupProps={{className: 'tools'}}
                        btnDefaultProps={{className: 'square-button-md no-border'}}
                        buttons={toolButtons}/>
                </div>
                }
            </div>
        );
    }
}

module.exports = draggableComponent(CoordinatesRow);
