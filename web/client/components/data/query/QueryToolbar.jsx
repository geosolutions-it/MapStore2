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
const {isEqual} = require('lodash');
const Modal = require('../../misc/Modal');
const {checkOperatorValidity, setupCrossLayerFilterDefaults, isCrossLayerFilterValid} = require('../../../utils/FilterUtils');
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
        emptyFilterWarning: PropTypes.bool,
        appliedFilter: PropTypes.object,
        storedFilter: PropTypes.object,
        advancedToolbar: PropTypes.bool,
        loadingError: PropTypes.bool
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
        advancedToolbar: false,
        loadingError: false,
        actions: {
            onQuery: () => {},
            onReset: () => {},
            onChangeDrawingStatus: () => {},
            onSaveFilter: () => {},
            onRestoreFilter: () => {},
            storeAppliedFilter: () => {}
        }
    };
    constructor(props) {
        super(props);
        this.state = {showModal: false};
    }
    getCurrentFilter = () => {
        return {
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
    }
    render() {
        let fieldsExceptions = this.props.filterFields.filter((field) => field.exception).length > 0;
        // let fieldsWithoutValues = this.props.filterFields.filter((field) => !field.value).length > 0;
        let fieldsWithValues = this.props.filterFields.filter((field) => field.value || field.value === 0).length > 0 || (this.props.allowEmptyFilter && !this.props.advancedToolbar);

        let queryDisabled =
            // fieldsWithoutValues ||
            fieldsExceptions ||
            !this.props.toolbarEnabled ||
            !fieldsWithValues && !this.props.spatialField.geometry && !isCrossLayerFilterValid(this.props.crossLayerFilter); 

        const isFilterChanged = !isEqual(this.props.appliedFilter, this.props.storedFilter);
        console.log(isFilterChanged, this.appliedFilterChanged());
        const showTooltip = this.props.emptyFilterWarning
            && this.props.filterFields.filter((field) => field.value).length === 0
            && !this.props.spatialField.geometry
            && !(this.props.crossLayerFilter && this.props.crossLayerFilter.attribute && this.props.crossLayerFilter.operation);
        const queryBtnMsgId = this.props.advancedToolbar ? "queryform.apply" : this.props.queryBtnMsgId;
        let buttons = [ {
            tooltipId: showTooltip ? "queryform.emptyfilter" : queryBtnMsgId,
            disabled: queryDisabled || (this.props.advancedToolbar && !this.appliedFilterChanged()),
            noTooltipWhenDisabled: true,
            glyph: this.props.advancedToolbar && "ok" || this.props.queryBtnGlyph,
            className: showTooltip ? "square-button-md showWarning" : "square-button-md",
            id: "query-toolbar-query",
            onClick: this.search
        }];
        if (this.props.advancedToolbar) {
            const disableSave = !isFilterChanged || !this.props.toolbarEnabled || this.props.loadingError || this.appliedFilterChanged();
            const disableRestore = !isFilterChanged || !this.props.storedFilter || !this.props.toolbarEnabled;
            const disableReset = !this.props.appliedFilter || !this.props.toolbarEnabled;
            buttons = buttons.concat([
                {
                tooltipId: "queryform.save",
                disabled: disableSave,
                noTooltipWhenDisabled: true,
                glyph: "floppy-disk",
                id: "query-toolbar-save",
                onClick: this.props.actions.onSaveFilter
            },
            {
                tooltipId: "queryform.discard",
                disabled: disableRestore,
                noTooltipWhenDisabled: true,
                glyph: "undo",
                id: "query-toolbar-discard",
                onClick: this.restorePersistedFilter
            },
            {
                tooltipId: "queryform.reset",
                glyph: "clear-filter",
                noTooltipWhenDisabled: true,
                id: "reset",
                disabled: disableReset,
                onClick: this.reset
            }]);
        }else {
            buttons = [{
                tooltipId: "queryform.reset",
                glyph: "clear-filter",
                noTooltipWhenDisabled: true,
                id: "reset",
                disabled: !this.props.toolbarEnabled,
                onClick: this.reset
            }].concat(buttons);
        }
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
    appliedFilterChanged = () => {


        const currentFilter = this.getCurrentFilter();
        const current = {
            groupFields: currentFilter.groupFields,
            filterFields: currentFilter.filterFields,
            spatialField: currentFilter.spatialField,
            crossLayerFilter: currentFilter.crossLayerFilter
        };
        const appliedFilter = this.props.appliedFilter || {};
        const applied = {
            groupFields: appliedFilter.groupFields,
            filterFields: appliedFilter.attributePanelExpanded && appliedFilter.filterFields || [],
            spatialField: appliedFilter.spatialPanelExpanded && appliedFilter.spatialField || {
                attribute: this.props.spatialField && this.props.spatialField.attribute
            },
            crossLayerFilter: appliedFilter.crossLayerExpanded && appliedFilter.crossLayerFilter && appliedFilter.crossLayerFilter.operation ? setupCrossLayerFilterDefaults(appliedFilter.crossLayerFilter) : null
        };
        console.log(current, applied);
        return !isEqual(current, applied);
    }
    search = () => {
        let filterObj = this.getCurrentFilter();
        this.props.actions.onQuery(this.props.searchUrl, filterObj, this.props.params);
        if (this.props.advancedToolbar) {
            this.props.actions.storeAppliedFilter();
        }
    };
    showModal = () => {
        this.setState(({showModal: true}));
    }
    reset = () => {

        this.props.actions.onChangeDrawingStatus('clean', '', "queryform", []);
        this.props.actions.onReset();
        if (this.props.advancedToolbar) {
            let filterObj = {
                featureTypeName: this.props.featureTypeName,
                groupFields: [],
                filterFields: [],
                spatialField: {
                        attribute: this.props.spatialField && this.props.spatialField.attribute
                    },

                pagination: this.props.pagination,
                filterType: this.props.filterType,
                ogcVersion: this.props.ogcVersion,
                sortOptions: this.props.sortOptions,
                crossLayerFilter: null,
                hits: this.props.hits
            };
            this.props.actions.onQuery(this.props.searchUrl, filterObj, this.props.params);
            this.setState(({showModal: false}));
        }
    };

    restorePersistedFilter = () => {
        this.props.actions.onRestoreFilter();
    }
}

module.exports = QueryToolbar;
