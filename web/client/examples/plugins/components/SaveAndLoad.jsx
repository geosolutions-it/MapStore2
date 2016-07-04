/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Input, Button} = require('react-bootstrap');


const SaveButton = React.createClass({
    propTypes: {
        onSave: React.PropTypes.func,
        onLoad: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            onSave: () => {},
            onLoad: () => {}
        };
    },
    getInitialState() {
        return {
            savename: '',
            loadname: ''
        };
    },
    onChangeSaveName(e) {
        this.setState({savename: e.target.value});
    },
    onChangeLoadName(e) {
        this.setState({loadname: e.target.options[e.target.selectedIndex].value});
    },
    renderSaved() {
        return [<option key="---" value="">---</option>, ...Object.keys(localStorage).filter((key) => key.indexOf('mapstore.example.plugins.') === 0)
            .map((key) => key.substring('mapstore.example.plugins.'.length))
            .map((name) => <option key={name} value={name}>{name}</option>)];
    },
    render() {
        return (<div className="save">
            <Button onClick={this.save} disabled={this.state.savename === ''}>Save</Button>
            <Input ref="savename" onChange={this.onChangeSaveName} type="text"/>
            <Button onClick={this.load} disabled={this.state.loadname === ''}>Load</Button>
            <Input ref="loadname" onChange={this.onChangeLoadName} type="select">
                {this.renderSaved()}
            </Input>
            </div>);
    },
    load() {
        this.props.onLoad(this.state.loadname);
    },
    save() {
        this.props.onSave(this.state.savename);
    }
});

module.exports = SaveButton;
