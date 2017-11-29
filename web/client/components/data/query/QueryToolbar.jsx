const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Button} = require('react-bootstrap');

const Modal = require('../../misc/Modal');
const {checkOperatorValidity, setupCrossLayerFilterDefaults} = require('../../../utils/FilterUtils');
const Toolbar = require('../../misc/toolbar/Toolbar');

class QueryToolbar extends React.Component {
    static propTypes = {
        filterType: PropTypes.string,
        params: PropTypes.object,
        filterFields: PropTypes.array,
        groupFields: PropTypes.array,
        spatialField: PropTypes.object,
        sendFilters: PropTypes.object,
        crossLayerFilter: PropTypes.object,
        toolbarEnabled: PropTypes.bool,
        searchUrl: PropTypes.string,
        showGeneratedFilter: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string
        ]),
        featureTypeName: PropTypes.string,
        actions: PropTypes.object,
        ogcVersion: PropTypes.string,
        titleMsgId: PropTypes.string,
        queryBtnMsgId: PropTypes.string,
        resultTitle: PropTypes.string,
        queryBtnGlyph: PropTypes.string,
        pagination: PropTypes.object,
        sortOptions: PropTypes.object,
        hits: PropTypes.bool,
        allowEmptyFilter: PropTypes.bool,
        emptyFilterWarning: PropTypes.bool
    };

    static defaultProps = {
        sendFilters: {
            attributeFilter: true,
            spatialFilter: true,
            crossLayerFilter: true
        },
        filterType: "OGC",
        params: {},
        groupFields: [],
        filterFields: [],
        spatialField: {},
        toolbarEnabled: true,
        searchUrl: null,
        showGeneratedFilter: false,
        featureTypeName: null,
        titleMsgId: "queryform.title",
        queryBtnMsgId: "queryform.query",
        resultTitle: "Generated Filter",
        queryBtnGlyph: "search",
        pagination: null,
        sortOptions: null,
        hits: false,
        allowEmptyFilter: false,
        emptyFilterWarning: false,
        actions: {
            onQuery: () => {},
            onReset: () => {},
            onChangeDrawingStatus: () => {}
        }
    };

    render() {
        let fieldsExceptions = this.props.filterFields.filter((field) => field.exception).length > 0;
        // let fieldsWithoutValues = this.props.filterFields.filter((field) => !field.value).length > 0;
        let fieldsWithValues = this.props.filterFields.filter((field) => field.value).length > 0 || this.props.allowEmptyFilter;

        let queryDisabled =
            // fieldsWithoutValues ||
            fieldsExceptions ||
            !this.props.toolbarEnabled ||
            !fieldsWithValues && !this.props.spatialField.geometry;


        const showTooltip = this.props.emptyFilterWarning && this.props.filterFields.filter((field) => field.value).length === 0 && !this.props.spatialField.geometry;

        const buttons = [{
            tooltipId: "queryform.reset",
            glyph: "clear-filter",
            id: "reset",
            disabled: !this.props.toolbarEnabled,
            onClick: this.reset
        }, {
            tooltipId: showTooltip ? "queryform.emptyfilter" : this.props.queryBtnMsgId,
            disabled: queryDisabled,
            glyph: this.props.queryBtnGlyph,
            id: "query-toolbar-query",
            onClick: this.search
        }];
        return (
            <div className="container-fluid query-toolbar">
                <Toolbar btnDefaultProps={{bsStyle: "primary", className: "square-button-md", tooltipPosition: "bottom"}} className="queryFormToolbar row-fluid pull-right" buttons={buttons} />
                <Modal show={this.props.showGeneratedFilter ? true : false} bsSize="large">
                    <Modal.Header>
                        <Modal.Title>{this.props.resultTitle}</Modal.Title>
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
    }

    search = () => {
        let filterObj = {
            featureTypeName: this.props.featureTypeName,
            groupFields: this.props.groupFields,
            filterFields: this.props.sendFilters
                && this.props.sendFilters.attributeFilter
                && this.props.filterFields.filter(field => checkOperatorValidity(field.value, field.operator))
                || [],
            spatialField: this.props.sendFilters
                && this.props.sendFilters.spatialFilter
                && this.props.spatialField
                || {
                    attribute: this.props.spatialField && this.props.spatialField.attribute
                },
            pagination: this.props.pagination,
            filterType: this.props.filterType,
            ogcVersion: this.props.ogcVersion,
            sortOptions: this.props.sortOptions,
            crossLayerFilter: this.props.sendFilters
                && this.props.sendFilters.crossLayerFilter
                && setupCrossLayerFilterDefaults(this.props.crossLayerFilter) || null,
            hits: this.props.hits
        };
        this.props.actions.onQuery(this.props.searchUrl, filterObj, this.props.params);
    };

    reset = () => {
        this.props.actions.onChangeDrawingStatus('clean', null, "queryform", []);
        this.props.actions.onReset();
    };
}

module.exports = QueryToolbar;
