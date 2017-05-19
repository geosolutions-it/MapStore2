const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Panel, Alert} = require('react-bootstrap');

const Message = require('../../I18N/Message');
const RulesTable = require('./RulesTable');
const RulesTablePagination = require('./RulesTablePagination');
const RulesTableControls = require('./RulesTableControls');
const LocaleUtils = require('../../../utils/LocaleUtils');

class RulesTablePanel extends React.Component {
    static propTypes = {
        onSelectRules: PropTypes.func,
        moveRules: PropTypes.func,
        moveRulesToPage: PropTypes.func,
        loadRules: PropTypes.func,
        deleteRules: PropTypes.func,
        rules: PropTypes.array,
        rulesPage: PropTypes.number,
        rulesCount: PropTypes.number,
        selectedRules: PropTypes.array,
        updateActiveRule: PropTypes.func,
        error: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        loadRules: () => {},
        error: {}
    };

    componentDidMount() {
        this.props.loadRules(1, false);
    }

    render() {
        return (
            <Panel header={LocaleUtils.getMessageById(this.context.messages, "rulesmanager.rules")}>
                <RulesTableControls
                    deleteRules={this.props.deleteRules}
                    selectedRules={this.props.selectedRules}
                    updateActiveRule={this.props.updateActiveRule}
                    rulesPage={this.props.rulesPage}
                    rulesCount={this.props.rulesCount}
                    moveRulesToPage={this.props.moveRulesToPage}
                    />
                <RulesTable
                    onSelectRules={this.props.onSelectRules}
                    rules={this.props.rules}
                    selectedRules={this.props.selectedRules}
                    moveRules={this.props.moveRules}/>
                <RulesTablePagination
                    loadRules={this.props.loadRules}
                    rulesPage={this.props.rulesPage}
                    rulesCount={this.props.rulesCount}/>
                { this.props.error.context === "table" &&
                    <Alert className="error-table-panel" bsStyle="danger">
                        <Message msgId={this.props.error.msgId}/>
                    </Alert>
                }
            </Panel>
        );
    }
}

module.exports = RulesTablePanel;
