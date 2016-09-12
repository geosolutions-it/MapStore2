/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Spinner = require('react-spinkit');
const Message = require('../../I18N/Message');
const ImporterUtils = require('../../../utils/ImporterUtils');
const {Table, Glyphicon, Button, Label} = require('react-bootstrap');

const ImportsGrid = React.createClass({
    propTypes: {
        loading: React.PropTypes.bool,
        loadImport: React.PropTypes.func,
        deleteImport: React.PropTypes.func,
        imports: React.PropTypes.array
    },
    getDefaultProps() {
        return {

            loadImport: () => {},
            deleteImport: () => {},
            imports: []
        };
    },
    getbsStyleForState(state) {
        return ImporterUtils.getbsStyleForState(state);
    },
    renderLoadingMessage(importObj) {
        switch (importObj.message) {
            case "deleting":
                return <Message msg="importer.import.deleting" />;
            default:
                return null;
        }
    },
    renderLoadingImport(importObj) {
        if (importObj.loading) {
            return <div style={{"float": "right"}}>{this.renderLoadingMessage(importObj)}<Spinner noFadeIn spinnerName="circle"/></div>;
        }
        return null;
    },
    renderImport(importObj) {
        return (<tr key={importObj && importObj.id}>
                <td key="id"><a onClick={(e) => {e.preventDefault(); this.props.loadImport(importObj.id); }} >{importObj.id}</a></td>
                <td key="state"><Label bsStyle={this.getbsStyleForState(importObj.state)}>{importObj.state}</Label>{this.renderLoadingImport(importObj)}</td>
                <td key="actions"><Button bsSize="xsmall" onClick={(e) => {e.preventDefault(); this.props.deleteImport(importObj.id); }}><Glyphicon glyph="remove"/></Button></td>
            </tr>);
    },
    render() {
        if (this.props.loading && this.props.imports.length === 0) {
            return (<Spinner noFadeIn spinnerName="circle"/>);
        }
        return (
            <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {this.props.imports.map(this.renderImport)}
                </tbody>
            </Table>
        );
    }
});
module.exports = ImportsGrid;
