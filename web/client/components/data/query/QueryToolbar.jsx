/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Button, Glyphicon, ButtonToolbar, Modal} = require('react-bootstrap');

const I18N = require('../../I18N/I18N');
const FilterUtils = require('../../../utils/FilterUtils');

const QueryToolbar = React.createClass({
    propTypes: {
        filterFields: React.PropTypes.array,
        groupFields: React.PropTypes.array,
        spatialField: React.PropTypes.object,
        toolbarEnabled: React.PropTypes.bool,
        searchUrl: React.PropTypes.string,
        actions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            groupFields: [],
            filterFields: [],
            spatialField: {},
            toolbarEnabled: true,
            searchUrl: null,
            actions: {
                onQuery: () => {},
                onReset: () => {},
                onChangeDrawingStatus: () => {}
            }
        };
    },
    render() {
        return (
            <div>
                <ButtonToolbar className="queryFormToolbar">
                    <Button disabled={!this.props.toolbarEnabled ||
                            (!(this.props.filterFields.length > 0) && !this.props.spatialField.geometry)} id="query" onClick={this.search}>
                        <Glyphicon glyph="glyphicon glyphicon-search"/>
                        <span style={{paddingLeft: "2px"}}><strong><I18N.Message msgId={"queryform.query"}/></strong></span>
                    </Button>
                    <Button disabled={!this.props.toolbarEnabled} id="reset" onClick={this.reset}>
                        <Glyphicon glyph="glyphicon glyphicon-remove"/>
                        <span style={{paddingLeft: "2px"}}><strong><I18N.Message msgId={"queryform.reset"}/></strong></span>
                    </Button>
                </ButtonToolbar>
                <Modal show={this.props.searchUrl ? true : false} bsSize="large">
                    <Modal.Header>
                        <Modal.Title>Generated Filter</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <textarea style={{width: "862px", maxWidth: "862px", height: "236px", maxHeight: "236px"}}>{this.props.searchUrl}</textarea>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button style={{"float": "right"}} onClick={() => this.props.actions.onQuery(null, null)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    },
    search() {
        let filterObj = {
            groupFields: this.props.groupFields,
            filterFields: this.props.filterFields,
            spatialField: this.props.spatialField
        };

        let filter = FilterUtils.toCQLFilter(filterObj);
        this.props.actions.onQuery(this.props.searchUrl, filter);
    },
    reset() {
        this.props.actions.onChangeDrawingStatus('clean', null, "queryform", []);
        this.props.actions.onReset();
    }
});

module.exports = QueryToolbar;
