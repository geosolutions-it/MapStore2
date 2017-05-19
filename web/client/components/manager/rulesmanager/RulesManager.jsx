const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const RulesTablePanel = require('./RulesTablePanel');
const RulesFiltersPanel = require('./RulesFiltersPanel');
const ActiveRuleModal = require('./ActiveRuleModal');

require('./RulesManager.css');

class RulesManager extends React.Component {
    static propTypes = {
        onSelectRules: PropTypes.func,
        moveRules: PropTypes.func,
        moveRulesToPage: PropTypes.func,
        loadRules: PropTypes.func,
        rules: PropTypes.array,
        rulesPage: PropTypes.number,
        rulesCount: PropTypes.number,
        selectedRules: PropTypes.array,
        rulesTableError: PropTypes.string,
        updateActiveRule: PropTypes.func,
        deleteRules: PropTypes.func,
        addRule: PropTypes.func,
        updateRule: PropTypes.func,
        loadRoles: PropTypes.func,
        loadUsers: PropTypes.func,
        loadWorkspaces: PropTypes.func,
        loadLayers: PropTypes.func,
        options: PropTypes.object,
        services: PropTypes.object,
        activeRule: PropTypes.object,
        updateFiltersValues: PropTypes.func,
        filtersValues: PropTypes.object,
        error: PropTypes.object
    };

    render() {
        return (
            <div>
                <RulesFiltersPanel
                    loadRoles={this.props.loadRoles}
                    loadUsers={this.props.loadUsers}
                    loadWorkspaces={this.props.loadWorkspaces}
                    loadLayers={this.props.loadLayers}
                    options={this.props.options}
                    services={this.props.services}
                    updateFiltersValues={this.props.updateFiltersValues}
                    filtersValues={this.props.filtersValues}
                    loadRules={this.props.loadRules}
                    error={this.props.error}/>
                <RulesTablePanel
                    onSelectRules={this.props.onSelectRules}
                    deleteRules={this.props.deleteRules}
                    rules={this.props.rules}
                    selectedRules={this.props.selectedRules}
                    moveRules={this.props.moveRules}
                    moveRulesToPage={this.props.moveRulesToPage}
                    loadRules={this.props.loadRules}
                    rulesPage={this.props.rulesPage}
                    rulesCount={this.props.rulesCount}
                    updateActiveRule={this.props.updateActiveRule}
                    error={this.props.error}/>
                <ActiveRuleModal
                    updateActiveRule={this.props.updateActiveRule}
                    addRule={this.props.addRule}
                    updateRule={this.props.updateRule}
                    loadRoles={this.props.loadRoles}
                    loadUsers={this.props.loadUsers}
                    loadWorkspaces={this.props.loadWorkspaces}
                    loadLayers={this.props.loadLayers}
                    options={this.props.options}
                    services={this.props.services}
                    activeRule={this.props.activeRule}
                    error={this.props.error}/>
            </div>
        );
    }
}

module.exports = RulesManager;
