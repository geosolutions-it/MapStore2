/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const AdaptiveGrid = require('../../misc/AdaptiveGrid');

const {featuresToGrid} = require('./enhancers/editor');
const rowRenderer = require('./renderers/RowRenderer');
const {isValidValueForPropertyName, isProperty} = require('../../../utils/FeatureGridUtils');


/**
 * A component that gets the describeFeatureType and the features to display
 * attributes
 * @class
 * @name FeatureGrid
 * @memberof components.data.featuregrid
 * @prop {geojson[]} features array of geojson features
 * @prop {object} describeFeatureType the describeFeatureType in json format
 * @prop {Component} gridComponent the grid component, if different from AdaptiveGrid
 * @prop {object} gridOptions to pass to the grid
 * @prop {object} gridEvents an object with events for the grid. Note: onRowsSelected, onRowsDeselected and onRowsToggled will be associated automatically from this object
 * to the rowSelection tool. If checkbox are enabled, onRowsSelected and onRowsDeselected will be triggered. If showCheckbox is false, onRowsToggled will be triggered.
 * @prop {object[]} tools. a list of tools. the format is the react-data-grid column format but with the following differences:
 * - The events are automatically binded to call the related callback with the feature as first parameter, second argument is the same, no original event is passed. describeFeatureType as third
 */
class FeatureGrid extends React.PureComponent {
    static propTypes = {
        autocompleteEnabled: PropTypes.bool,
        editingAllowedRoles: PropTypes.array,
        gridOpts: PropTypes.object,
        changes: PropTypes.object,
        selectBy: PropTypes.object,
        customEditorsOptions: PropTypes.object,
        features: PropTypes.array,
        showDragHandle: PropTypes.bool,
        gridComponent: PropTypes.func,
        describeFeatureType: PropTypes.object,
        columnSettings: PropTypes.object,
        gridOptions: PropTypes.object,
        actionOpts: PropTypes.object,
        initPlugin: PropTypes.func,
        tools: PropTypes.array,
        gridEvents: PropTypes.object,
        virtualScroll: PropTypes.bool,
        maxStoredPages: PropTypes.number
    };
    static childContextTypes = {
        isModified: PropTypes.func,
        isValid: PropTypes.func,
        isProperty: PropTypes.func
    };
    static defaultProps = {
        editingAllowedRoles: ["ADMIN"],
        initPlugin: () => {},
        autocompleteEnabled: false,
        gridComponent: AdaptiveGrid,
        changes: {},
        gridEvents: {},
        gridOpts: {},
        describeFeatureType: {},
        columnSettings: {},
        features: [],
        tools: [],
        showDragHandle: false,
        virtualScroll: false,
        maxStoredPages: 5
    };
    constructor(props) {
        super(props);
    }
    // TODO: externalize initPlugin
    componentDidMount() {
        this.props.initPlugin({virtualScroll: this.props.virtualScroll, editingAllowedRoles: this.props.editingAllowedRoles, maxStoredPages: this.props.maxStoredPages});
    }
    getChildContext() {
        return {
            isModified: (id, key) => {
                return this.props.changes.hasOwnProperty(id) &&
                    this.props.changes[id].hasOwnProperty(key);
            },
            isProperty: (k) => k === "geometry" || isProperty(k, this.props.describeFeatureType),
            isValid: (val, key) => this.props.describeFeatureType ? isValidValueForPropertyName(val, key, this.props.describeFeatureType) : true
        };
    }
    render() {
        const Grid = this.props.gridComponent;
        return (<Grid
            rowRenderer={rowRenderer}
            {...this.props}
        />);
    }
}
module.exports = featuresToGrid(FeatureGrid);
