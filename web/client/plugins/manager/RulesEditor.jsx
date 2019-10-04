/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');

const {isSaveDisabled, isRulePristine, isRuleValid, askConfirm} = require("../../utils/RulesEditor");
const Message = require('../../components/I18N/Message');
const BorderLayout = require("../../components/layout/BorderLayout");
const Header = require("../../components/manager/rulesmanager/ruleseditor/Header");
const MainEditor = require("../../components/manager/rulesmanager/ruleseditor/EditMain");
const StylesEditor = require("../../components/manager/rulesmanager/ruleseditor/StylesEditor");
const FiltersEditor = require("../../components/manager/rulesmanager/ruleseditor/FiltersEditor");
const AttributesEditor = require("../../components/manager/rulesmanager/ruleseditor/AttributesEditor");
const ModalDialog = require("../../components/manager/rulesmanager/ModalDialog");


class RuleEditor extends React.Component {
    static propTypes = {
        initRule: PropTypes.object,
        disableDetails: PropTypes.bool,
        activeRule: PropTypes.object,
        activeEditor: PropTypes.string,
        onNavChange: PropTypes.func,
        setOption: PropTypes.func,
        setConstraintsOption: PropTypes.func,
        onExit: PropTypes.func,
        onSave: PropTypes.func,
        onDelete: PropTypes.func,
        styles: PropTypes.array,
        type: PropTypes.string,
        properties: PropTypes.array,
        loading: PropTypes.bool,
        cleanConstraints: PropTypes.func,
        layer: PropTypes.object
    }
    static defaultProps = {
        activeEditor: "1",
        onNavChange: () => {},
        setOption: () => {},
        onExit: () => {},
        onSave: () => {},
        onDelete: () => {},
        type: ""
    }
    render() {
        const { loading, activeRule, layer, activeEditor, onNavChange, initRule, styles = [], setConstraintsOption, type, properties, disableDetails} = this.props;
        const {modalProps} = this.state || {};
        return (
            <BorderLayout
                className="bg-body"
                header={<Header
                    disableDetails={disableDetails}
                    layer={layer}
                    loading={loading}
                    type={type}
                    onSave={this.save}
                    onExit={this.cancelEditing}
                    activeTab={activeEditor}
                    disableSave={isSaveDisabled(activeRule, initRule)}
                    rule={activeRule}
                    onNavChange={onNavChange}/>}
            >
                <MainEditor key="main-editor" rule={activeRule} setOption={this.setOption} active={activeEditor === "1"}/>
                <StylesEditor styles={styles} key="styles-editor" constraints={activeRule && activeRule.constraints} setOption={setConstraintsOption} active={activeEditor === "2"}/>
                <FiltersEditor layer={layer} key="filters-editor" setOption={setConstraintsOption} constraints={activeRule && activeRule.constraints} active={activeEditor === "3"}/>
                <AttributesEditor key="attributes-editor" active={activeEditor === "4"} attributes={properties} constraints={activeRule && activeRule.constraints} setOption={setConstraintsOption}/>
                <ModalDialog {...modalProps}/>
            </BorderLayout>);
    }
    cancelEditing = () => {
        const {activeRule, initRule, onExit} = this.props;
        if (!isRulePristine(activeRule, initRule)) {
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
        } else {
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
    setOption = ({key, value}) => {
        if (askConfirm(this.props.activeRule, key, value)) {
            this.setState( () => ({modalProps: {title: "rulesmanager.resetconstraints",
                showDialog: true, buttons: [{
                    text: <Message msgId="no"/>,
                    bsStyle: 'primary',
                    onClick: this.cancel
                },
                {
                    text: <Message msgId="yes"/>,
                    bsStyle: 'primary',
                    onClick: () => {
                        this.cancel();
                        this.props.setOption({key, value});
                        this.props.cleanConstraints(key === 'grant');
                    }
                }
                ], closeAction: this.cancel, msg: "rulesmanager.constraintsmsg"}}));

        } else {
            this.props.setOption({key, value});
        }

    }
}
module.exports = RuleEditor;
