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
        filterType: React.PropTypes.string,
        authParam: React.PropTypes.object,
        filterFields: React.PropTypes.array,
        groupFields: React.PropTypes.array,
        spatialField: React.PropTypes.object,
        toolbarEnabled: React.PropTypes.bool,
        searchUrl: React.PropTypes.string,
        showGeneratedFilter: React.PropTypes.oneOfType([
            React.PropTypes.bool,
            React.PropTypes.string
        ]),
        featureTypeName: React.PropTypes.string,
        actions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            filterType: "OGC",
            authParam: {},
            groupFields: [],
            filterFields: [],
            spatialField: {},
            toolbarEnabled: true,
            searchUrl: null,
            showGeneratedFilter: false,
            featureTypeName: null,
            actions: {
                onQuery: () => {},
                onReset: () => {},
                onChangeDrawingStatus: () => {}
            }
        };
    },
    render() {
        let fieldsExceptions = this.props.filterFields.filter((field) => field.exception).length > 0;
        // let fieldsWithoutValues = this.props.filterFields.filter((field) => !field.value).length > 0;
        let fieldsWithValues = this.props.filterFields.filter((field) => field.value).length > 0;

        let queryDisabled =
            // fieldsWithoutValues ||
            fieldsExceptions ||
            !this.props.toolbarEnabled ||
            (!fieldsWithValues && !this.props.spatialField.geometry);

        return (
            <div>
                <ButtonToolbar className="queryFormToolbar">
                    <Button disabled={queryDisabled} id="query" onClick={this.search}>
                        <Glyphicon glyph="glyphicon glyphicon-search"/>
                        <span style={{paddingLeft: "2px"}}><strong><I18N.Message msgId={"queryform.query"}/></strong></span>
                    </Button>
                    <Button disabled={!this.props.toolbarEnabled} id="reset" onClick={this.reset}>
                        <Glyphicon glyph="glyphicon glyphicon-remove"/>
                        <span style={{paddingLeft: "2px"}}><strong><I18N.Message msgId={"queryform.reset"}/></strong></span>
                    </Button>
                </ButtonToolbar>
                <Modal show={this.props.showGeneratedFilter ? true : false} bsSize="large">
                    <Modal.Header>
                        <Modal.Title>Generated Filter</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <textarea style={{width: "862px", maxWidth: "862px", height: "236px", maxHeight: "236px"}}>{this.props.showGeneratedFilter}</textarea>
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
            filterFields: this.props.filterFields.filter((field) => field.value),
            spatialField: this.props.spatialField
        };

        let filter = this.props.filterType === "OGC" ?
            FilterUtils.toOGCFilter(this.props.featureTypeName, filterObj) :
            FilterUtils.toCQLFilter(filterObj);

        this.props.actions.onQuery(this.props.searchUrl, filter, {authkey: this.props.authParam.authkey});
    },
    reset() {
        this.props.actions.onChangeDrawingStatus('clean', null, "queryform", []);
        this.props.actions.onReset();
    }
});

module.exports = QueryToolbar;
