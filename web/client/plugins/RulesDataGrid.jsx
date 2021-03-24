/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import LoadingView from '../components/misc/LoadingView';

import ContainerDimensions from 'react-container-dimensions';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { createSelector } from 'reselect';

import { error } from '../actions/notifications';
import { rulesSelected, setFilter, setLoading } from '../actions/rulesmanager';
import rulesgridComp from '../components/manager/rulesmanager/rulesgrid/enhancers/rulesgrid';
import rulesmanager from '../reducers/rulesmanager';
import { filterSelector, isEditorActive, selectedRules, triggerLoadSel } from '../selectors/rulesmanager';
const RulesGridComp = React.lazy(() => import('../components/manager/rulesmanager/rulesgrid/RulesGrid'));
const ruelsSelector = createSelector([selectedRules, filterSelector, triggerLoadSel], (rules, filters, triggerLoad) => {
    return {
        selectedIds: rules.map(r => r.id),
        filters,
        triggerLoad
    };
});
const rulesGridEnhancer = compose(
    connect( ruelsSelector, {onSelect: rulesSelected, onLoadError: error, setLoading, setFilters: setFilter}),
    rulesgridComp);

const RulesGrid = rulesGridEnhancer(RulesGridComp);

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
                 <Suspense fallback={<LoadingView />}>
                     <RulesGrid width={width} height={height}/>
                 </Suspense>
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

export default {
    RulesDataGridPlugin,
    reducers: {rulesmanager}
};
