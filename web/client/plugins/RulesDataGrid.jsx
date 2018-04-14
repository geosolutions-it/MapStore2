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
const {selectedRules} = require('../selectors/rulesmanager');

const ContainerDimensions = require('react-container-dimensions').default;
const PropTypes = require('prop-types');
const {rulesSelected, setLoading} = require("../actions/rulesmanager");
const {error} = require('../actions/notifications');
const ruelsSelector = createSelector(selectedRules, (rules) => ({
    selectedIds: rules.map(r => r.id)
}));
const rulesGridEnhancer = compose(
    connect( ruelsSelector, {onSelect: rulesSelected, onLoadError: error, setLoading}),
    require('../components/manager/rulesmanager/rulesgrid/enhancers/rulesgrid'));

const RulesGrid = rulesGridEnhancer(require('../components/manager/rulesmanager/rulesgrid/RulesGrid'));


class RulesDataGridPlugin extends React.Component {
     static propTypes = {
         enabled: PropTypes.bool
     };
     static defaultProps = {
         enabled: true
     };
    render() {
        return (<ContainerDimensions>{({width, height}) =>
            (<div className="ms2">
                <RulesGrid width={width} height={height - 52}/>
            </div>)
        }
        </ContainerDimensions>);
    }
}

module.exports = {
    RulesDataGridPlugin,
    reducers: {rulesmanager: require('../reducers/rulesmanager')}
};
