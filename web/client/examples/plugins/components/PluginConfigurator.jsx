/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Input, Button, Glyphicon} = require('react-bootstrap');

const Codemirror = require('react-codemirror');
require('react-codemirror/node_modules/codemirror/lib/codemirror.css');

require('react-codemirror/node_modules/codemirror/mode/javascript/javascript');


const PluginConfigurator = React.createClass({
    propTypes: {
        pluginName: React.PropTypes.string,
        pluginsCfg: React.PropTypes.array,
        onToggle: React.PropTypes.func,
        onApplyCfg: React.PropTypes.func,
        pluginConfig: React.PropTypes.string
    },
    getInitialState() {
        return {
            configVisible: false,
            code: "{}"
        };
    },
    componentWillMount() {
        this.setState({
            code: this.props.pluginConfig
        });
    },
    componentWillReceiveProps(newProps) {
        if (newProps.pluginConfig !== this.props.pluginConfig) {
            this.setState({
                code: newProps.pluginConfig
            });
        }
    },
    renderCfg() {
        return this.state.configVisible ? [
            <label key="config-label">Enter a JSON object to configure plugin properties</label>,
            <Codemirror key="code-mirror" value={this.state.code} onChange={this.updateCode} options={{
                    mode: {name: "javascript", json: true},
                    lineNumbers: true
                }}/>,
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
    updateCode: function(newCode) {
        this.setState({
            code: newCode
        });
    },
    toggleCfg() {
        this.setState({configVisible: !this.state.configVisible});
    },
    applyCfg() {
        this.props.onApplyCfg(this.state.code);
    }
});

module.exports = PluginConfigurator;
