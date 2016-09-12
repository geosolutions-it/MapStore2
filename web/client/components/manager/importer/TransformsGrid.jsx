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
const {Panel, Table, Button, Glyphicon} = require('react-bootstrap');

const TransformsGrid = React.createClass({
    propTypes: {
        loading: React.PropTypes.bool,
        panProps: React.PropTypes.object,
        type: React.PropTypes.string,
        loadTransform: React.PropTypes.func,
        deleteTransform: React.PropTypes.func,
        transforms: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            transforms: [],
            loadTransform: () => {},
            deleteTransform: () => {}
        };
    },
    renderTransform(transform, index) {
        return (<tr key={index}>
                <td key="id"><a onClick={(e) => {e.preventDefault(); this.props.loadTransform(index); }}>{index}</a></td>
                <td key="type">{transform.type}</td>
                <td key="actions"><Button bsSize="xsmall" onClick={(e) => {e.preventDefault(); this.props.deleteTransform(index); }}><Glyphicon glyph="remove"/></Button></td>
            </tr>);
    },
    render() {
        if (this.props.loading && this.props.transforms.length === 0) {
            return (<Spinner noFadeIn spinnerName="circle"/>);
        }
        return (
            <Panel {...this.props.panProps} header={<span><Message msgId="importer.task.transforms" /></span>}>
            <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th><Message msgId="importer.transforms.type" /></th>
                    <th><Message msgId="importer.transforms.actions" /></th>
                  </tr>
                </thead>
                <tbody>
                    {this.props.transforms.map(this.renderTransform)}
                </tbody>
            </Table>
            </Panel>
        );
    }
});
module.exports = TransformsGrid;
