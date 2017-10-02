const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const Slider = require('react-nouislider');
const {Label, Checkbox} = require('react-bootstrap');
const {DropdownList} = require('react-widgets');
const Message = require('../../../I18N/Message');
require('react-widgets/lib/less/react-widgets.less');
module.exports = class extends React.Component {
    static propTypes = {
        opacityText: PropTypes.node,
        element: PropTypes.object,
        formats: PropTypes.array,
        settings: PropTypes.object,
        onChange: PropTypes.func
    };

    static defaultProps = {
        onChange: () => {}
    };

    render() {
        return (<div>
            {this.props.element.type === "wms" ?
            [(<label key="format-label" className="control-label"><Message msgId="layerProperties.format" /></label>),
            (<DropdownList
                key="format-dropdown"
                data={this.props.formats || ["image/png", "image/png8", "image/jpeg", "image/vnd.jpeg-png", "image/gif"]}
                value={this.props.element && this.props.element.format || "image/png"}
                onChange={(value) => {
                    this.props.onChange("format", value);
                }} />)] : null}
            <div key="opacity">
            <label key="opacity-label" className="control-label">{this.props.opacityText}</label>
            <Slider key="opacity-slider" start={[Math.round(this.props.settings.options.opacity * 100)]}
                range={{min: 0, max: 100}}
                onChange={(opacity) => {this.props.onChange("opacity", opacity / 100); }}/>
            <Label key="opacity-percent" >{Math.round(this.props.settings.options.opacity * 100) + "%"}</Label>
            </div>
            {this.props.element.type === "wms" ?
                [(<div key="transparent-check">
                    <Checkbox key="transparent" checked={this.props.element && (this.props.element.transparent === undefined ? true : this.props.element.transparent)} onChange={(event) => {this.props.onChange("transparent", event.target.checked); }}>
                        <Message msgId="layerProperties.transparent"/></Checkbox>
                    <Checkbox key="cache" value="tiled" key="tiled"
                        disabled={!!this.props.element.singleTile}
                        onChange={(e) => this.props.onChange("tiled", e.target.checked)}
                        checked={this.props.element && this.props.element.tiled !== undefined ? this.props.element.tiled : true} >
                        <Message msgId="layerProperties.cached"/>
                    </Checkbox>
                    <Checkbox key="singleTile" value="singleTile" key="singleTile"
                        checked={this.props.element && (this.props.element.singleTile !== undefined ? this.props.element.singleTile : false )}
                        onChange={(e) => this.props.onChange("singleTile", e.target.checked)}>
                        <Message msgId="layerProperties.singleTile"/>
                    </Checkbox>
                </div>)] : null}
        </div>);
    }
};
