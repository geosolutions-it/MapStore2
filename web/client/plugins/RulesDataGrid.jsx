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
import { gsInstancesSelected, rulesSelected, setFilter, setLoading, updateActiveGrid } from '../actions/rulesmanager';
import rulesgridComp from '../components/manager/rulesmanager/rulesgrid/enhancers/rulesgrid';
import gsInstgridComp from '../components/manager/rulesmanager/rulesgrid/enhancers/GSInstances/gsInstancesGrid';
import rulesmanager from '../reducers/rulesmanager';
import { filterSelector, isEditorActive, selectedRules, selectedGSInstances, triggerLoadSel } from '../selectors/rulesmanager';
import { Tabs, Tab } from 'react-bootstrap';
import Message from '../components/I18N/Message';
import Api from '../api/geoserver/GeoFence';
const RulesGridComp = React.lazy(() => import('../components/manager/rulesmanager/rulesgrid/RulesGrid'));
const GSInstancesGrid = React.lazy(() => import('../components/manager/rulesmanager/rulesgrid/GSInstancesGrid'));
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

// for gs instance in case geofence stand-alone geofence
const gsInstanceSelector = createSelector([selectedGSInstances, filterSelector, triggerLoadSel], (gsInstances, filters, triggerLoad) => {
    return {
        selectedGSInstanceIds: gsInstances.map(r => r.id),
        filters,
        triggerLoad
    };
});
const gsInstGridEnhancer = compose(
    connect( gsInstanceSelector, {onSelect: gsInstancesSelected, onLoadError: error, setLoading}),
    gsInstgridComp);
const GSInstancesGridComp = gsInstGridEnhancer(GSInstancesGrid);

/**
  * @name RulesDataGrid
  * @memberof plugins
  * @class
  * @prop {boolean} cfg.virtualScroll default true. Activates virtualScroll. When false the grid uses normal pagination
  * @prop {number} cfg.maxStoredPages default 5. In virtual Scroll mode determines the size of the loaded pages cache
  * @prop {number} cfg.vsOverScan default 20. Number of rows to load above/below the visible slice of the grid
  * @prop {number} cfg.scrollDebounce default 50. milliseconds of debounce interval between two scroll event
  * @classdesc
  * Rules-grid it's part of {@link api/framework#pages.RulesManager|rules-manager page}. It loads GeoFence's rules from configured geofence instance.
  * It uses virtualScroll to manage rules loading. It allows to order GeoFence's rules by drag and drop.
  * Rules can be filtered selecting values form columns' header.
*/

class RulesDataGrid extends React.Component {
     static propTypes = {
         enabled: PropTypes.bool,
         activeGrid: PropTypes.string,
         updateActiveGrid: PropTypes.func
     };
     static defaultProps = {
         enabled: true,
         activeGrid: 'rules',
         updateActiveGrid: () => {}
     };
     render() {
         const isStandAloneGeoFence = Api.getRuleServiceType() === 'geofence';
         //  render if geofence is standalone
         if (isStandAloneGeoFence) {
             return (<ContainerDimensions>{({width, height}) =>
                 (<div className={`rules-data-gird ${this.props.enabled ? "" : "hide-locked-cell"}`}>
                     <Tabs defaultActiveKey={this.props.activeGrid} onSelect={(value) => this.props.updateActiveGrid(value)} id="rules-manager-tabs">
                         <Tab eventKey={'rules'} title={<Message msgId="rulesmanager.tabs.rules" />} style={{paddingTop: 8}}>
                             {!this.props.enabled && (<div className="ms-overlay"/>)}
                             <Suspense fallback={<LoadingView />}>
                                 {this.props.activeGrid === 'rules' && <RulesGrid width={width} height={height}/>}
                             </Suspense>
                         </Tab>
                         <Tab eventKey={'gsInstances'} title={<Message msgId="rulesmanager.tabs.gsInstances" />} style={{paddingTop: 8}}>
                             {!this.props.enabled && (<div className="ms-overlay"/>)}
                             <Suspense fallback={<LoadingView />}>
                                 {this.props.activeGrid === 'gsInstances' && <GSInstancesGridComp width={width} height={height}/>}
                             </Suspense>
                         </Tab>
                     </Tabs>
                 </div>)
             }
             </ContainerDimensions>);
         }
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
        (state) => state.rulesmanager.activeGrid,
        (editing, activeGrid) => ({enabled: !editing, activeGrid})
    ), {
        updateActiveGrid
    }
)(RulesDataGrid);

export default {
    RulesDataGridPlugin,
    reducers: {rulesmanager}
};
