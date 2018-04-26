/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');

const {connect} = require('react-redux');
const {createSelector} = require("reselect");
const {compose} = require('recompose');
const enhancer = require("./EditorEnhancer");
const {cleanEditing, saveRule} = require("../../actions/rulesmanager");
const {activeRuleSelector} = require("../../selectors/rulesmanager");

const {isEqual} = require("lodash");

const Message = require('../../components/I18N/Message');
const BorderLayout = require("../../components/layout/BorderLayout");
const Header = require("../../components/manager/rulesmanager/ruleseditor/Header");
const MainEditor = require("../../components/manager/rulesmanager/ruleseditor/EditMain");
const ModalDialog = require("./ModalDialog");
const {isRuleValid} = require("../../utils/RulesGridUtils");

class RuleEditor extends React.Component {
    static propTypes = {
        initRule: PropTypes.object,
        activeRule: PropTypes.object,
        activeEditor: PropTypes.string,
        onNavChange: PropTypes.func,
        setOption: PropTypes.func,
        onExit: PropTypes.func,
        onSave: PropTypes.func,
        onDelete: PropTypes.func
    }
    static defaultProps = {
        activeEditor: "1",
        onNavChange: () => {},
        setOption: () => {},
        onExit: () => {},
        onSave: () => {},
        onDelete: () => {}
    }
    render() {
        const {activeRule, activeEditor, onNavChange, setOption, initRule} = this.props;
        const {modalProps} = this.state || {};
        return (
            <BorderLayout
                className="bg-body"
                header={<Header onSave={this.save} onExit={this.cancelEditing} activeTab={activeEditor} disableSave={isEqual(activeRule, initRule)} detailsActive={activeRule && activeRule.layer} onNavChange={onNavChange}/>}>
                <MainEditor key="main-editor" rule={activeRule} setOption={setOption} active={activeEditor === "1"}/>
                <ModalDialog {...modalProps}/>
            </BorderLayout>);
    }
    cancelEditing = () => {
        const {activeRule, initRule, onExit} = this.props;
        if (!isEqual(activeRule, initRule)) {
            this.setState( () => ({modalProps: {title: "featuregrid.toolbar.saveChanges",
                showDialog: true, buttons: [{
                        text: <Message msgId="no"/>,
                        bsStyle: 'primary',
                        onClick: this.cancel
                    },
                    {
                        text: <Message msgId="yes"/>,
                        bsStyle: 'primary',
                        onClick: onExit
                    }
                ], closeAction: this.cancel, msg: "map.details.sureToClose"}}));
        } else {
            onExit();
        }
    }
    cancel = () => {
        this.setState( () => ({modalProps: {showDialog: false}}));
    }
    save = () => {
        const {activeRule, onSave} = this.props;
        if (isRuleValid(activeRule)) {
            onSave(activeRule);
        }else {
            this.setState( () => ({modalProps: {title: "featuregrid.toolbar.saveChanges",
                showDialog: true, buttons: [
                        {
                            text: 'Ok',
                            bsStyle: 'primary',
                            onClick: this.cancel
                        }
                    ], closeAction: this.cancel, msg: "rulesmanager.invalidForm"}}));
        }
    }
}

module.exports = compose(
    connect(createSelector(activeRuleSelector, activeRule => ({activeRule})), {
        onExit: cleanEditing,
        onSave: saveRule
    }),
    enhancer)(RuleEditor);
