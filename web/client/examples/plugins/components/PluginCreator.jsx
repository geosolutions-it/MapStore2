const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Button, Glyphicon, Modal, Checkbox, FormGroup} = require('react-bootstrap');

const {Controlled: Codemirror} = require('react-codemirror2');


require('codemirror/lib/codemirror.css');

require('codemirror/mode/javascript/javascript');

class PluginCreator extends React.Component {
    static propTypes = {
        pluginCode: PropTypes.string,
        error: PropTypes.string,
        onApplyCode: PropTypes.func
    };

    static defaultProps = {
        pluginCode: '',
        onApplyCode: () => {}
    };

    state = {
        code: "",
        configVisible: false
    };

    componentWillMount() {
        this.setState({
            code: this.props.pluginCode
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.pluginCode !== this.props.pluginCode) {
            this.setState({
                code: newProps.pluginCode
            });
        }
    }

    render() {
        return (<li style={{border: "solid 1px lightgrey", borderRadius: "3px", paddingLeft: "10px", paddingRight: "10px", marginBottom: "3px", marginRight: "10px"}} key="plugin-creator">
        <Button bsSize="small" bsStyle="primary" onClick={this.toggleCfg}><Glyphicon glyph={this.state.configVisible ? "minus" : "plus"}/></Button>
            <FormGroup>
              <Checkbox className="pluginEnable" name="toolscontainer"
                  disabled
                  checked
                  >
                  Live edit your plugin
              </Checkbox>
          </FormGroup>
            <Modal show={this.state.configVisible} bsSize="large" backdrop={false} onHide={() => {
                this.setState({
                  configVisible: false
                });
            }}>
                <Modal.Header className="dialog-error-header-side" closeButton>
                    <Modal.Title>Live edit your own plugin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Codemirror style={{width: '500px'}} key="code-mirror" value={this.state.code} onBeforeChange={this.updateCode} options={{
                          mode: {name: "javascript"},
                          lineNumbers: true
                      }}/>
                  <Button key="apply-cfg" bsStyle="primary" onClick={this.applyCode}>Apply</Button>
                  <div className="error">{this.props.error}</div>
                </Modal.Body>
            </Modal>
        </li>);
    }

    updateCode = (editor, data, newCode) => {
        this.setState({
            code: newCode
        });
    };

    applyCode = () => {
        this.props.onApplyCode(this.state.code);
    };

    toggleCfg = () => {
        this.setState({configVisible: !this.state.configVisible});
    };
}

module.exports = PluginCreator;
