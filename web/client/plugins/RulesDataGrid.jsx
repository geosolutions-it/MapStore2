/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {compose} = require("recompose");

const {createSelector} = require('reselect');
const {selectedRules, filterSelector, isEditorActive, triggerLoadSel} = require('../selectors/rulesmanager');

const ContainerDimensions = require('react-container-dimensions').default;
const PropTypes = require('prop-types');
const {rulesSelected, setLoading, setFilter} = require("../actions/rulesmanager");
const {error} = require('../actions/notifications');

const ruelsSelector = createSelector([selectedRules, filterSelector, triggerLoadSel], (rules, filters, triggerLoad) => {
    return {
        selectedIds: rules.map(r => r.id),
        filters,
        triggerLoad
    };
});
const rulesGridEnhancer = compose(
    connect( ruelsSelector, {onSelect: rulesSelected, onLoadError: error, setLoading, setFilters: setFilter}),
    require('../components/manager/rulesmanager/rulesgrid/enhancers/rulesgrid'));

const RulesGrid = rulesGridEnhancer(require('../components/manager/rulesmanager/rulesgrid/RulesGrid'));

/**
  * @name RulesDataGrid
  * @memberof plugins
  * @class
  * @prop {boolean} cfg.virtualScroll default true. Activates virtualScroll. When false the grid uses normal pagination
  * @prop {number} cfg.maxStoredPages default 5. In virtual Scroll mode determines the size of the loaded pages cache
  * @prop {number} cfg.vsOverScan default 20. Number of rows to load above/below the visible slice of the grid
  * @prop {number} cfg.scrollDebounce default 50. milliseconds of debounce interval between two scroll event
  * @classdesc
  * Rules-grid it's part of rules-manager page. It loads GeoFence's rules from configured geofence instance.
  * It uses virtualScroll to manage rules loading. It allows to order GeoFence's rules by drag and drop.
  * Rules can be filtered selecting values form columns' header.
*/

class RulesDataGrid extends React.Component {
     static propTypes = {
         enabled: PropTypes.bool
     };
     static defaultProps = {
         enabled: true
     };
     render() {
         return (<ContainerDimensions>{({width, height}) =>
             (<div className={`rules-data-gird ${this.props.enabled ? "" : "hide-locked-cell"}`}>
                 {!this.props.enabled && (<div className="ms-overlay"/>)}
                 <RulesGrid width={width} height={height}/>
             </div>)
         }
         </ContainerDimensions>);
     }
}
const RulesDataGridPlugin = connect(
    createSelector(
        isEditorActive,
        editing => ({enabled: !editing})
    ), {
        // setEditing,
        // onMount: () => setEditorAvailable(true),
        // onUnmount: () => setEditorAvailable(false)
    }
)(RulesDataGrid);
module.exports = {
    RulesDataGridPlugin,
    reducers: {rulesmanager: require('../reducers/rulesmanager')}
};
