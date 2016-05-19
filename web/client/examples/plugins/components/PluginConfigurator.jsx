/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Input, Button, Glyphicon} = require('react-bootstrap');


const PluginConfigurator = React.createClass({
    propTypes: {
        pluginName: React.PropTypes.string,
        pluginsCfg: React.PropTypes.array,
        onToggle: React.PropTypes.func,
        onApplyCfg: React.PropTypes.func
    },
    getInitialState() {
        return {
            configVisible: false
        };
    },
    renderCfg() {
        return this.state.configVisible ? [
            <label key="config-label">Enter a JSON object to configure plugin properties</label>,
            <Input key="config-field" type="textarea" ref="cfg"/>,
            <Button key="apply-cfg" onClick={this.applyCfg}>Apply</Button>
        ] : null;
    },
    render() {
        return (<li style={{border: "solid 1px lightgrey", borderRadius: "3px", paddingLeft: "10px", paddingRight: "10px", marginBottom: "3px", marginRight: "10px"}} key={this.props.pluginName + "enable"}>
            <Button bsSize="small" onClick={this.toggleCfg}><Glyphicon glyph={this.state.configVisible ? "minus" : "plus"}/></Button>
            <Input className="pluginEnable" type="checkbox" name="toolscontainer"
                disabled={this.props.pluginName === 'Map'}
                checked={this.props.pluginsCfg.indexOf(this.props.pluginName) !== -1}
                label={this.props.pluginName}
                onChange={this.props.onToggle}/>

            {this.renderCfg()}
        </li>);
    },
    toggleCfg() {
        this.setState({configVisible: !this.state.configVisible});
    },
    applyCfg() {
        this.props.onApplyCfg(this.refs.cfg.getValue());
    }
});

module.exports = PluginConfigurator;
