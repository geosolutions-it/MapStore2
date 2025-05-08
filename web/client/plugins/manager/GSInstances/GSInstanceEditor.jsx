/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { isGSInstanceValid, isGSInstancePristine, isSaveGSInstanceDisabled } from '../../../utils/RulesEditorUtils';
import Message from '../../../components/I18N/Message';
import BorderLayout from '../../../components/layout/BorderLayout';
import GSInstanceHeader from '../../../components/manager/rulesmanager/ruleseditor/GSInstance/Header';
import ModalDialog from '../../../components/manager/rulesmanager/ModalDialog';
import EditGSInstanceMain from '../../../components/manager/rulesmanager/ruleseditor/GSInstance/EditGSInstanceMain';


class GSInstanceEditor extends React.Component {
    static propTypes = {
        initGSInstance: PropTypes.object,
        activeGSInstance: PropTypes.object,
        activeEditor: PropTypes.string,
        onNavChange: PropTypes.func,
        setOption: PropTypes.func,
        onExitGSInstance: PropTypes.func,
        onSaveGSItance: PropTypes.func,
        onDelete: PropTypes.func,
        loading: PropTypes.bool
    }
    static defaultProps = {
        activeEditor: "1",
        onNavChange: () => {},
        setOption: () => {},
        onExitGSInstance: () => {},
        onSaveGSItance: () => {},
        onDelete: () => {}
    }
    constructor(props) {
        super(props);
        this.state = {
            isCreateNew: Object.keys(this.props.activeGSInstance || {}).length === 0
        };
    }
    setOption = ({key, value}) => {
        this.props.setOption({key, value});
    }
    render() {
        const { loading, activeGSInstance, activeEditor, onNavChange, initGSInstance} = this.props;
        const {modalProps} = this.state || {};
        return (
            <BorderLayout
                className="bg-body"
                header={<GSInstanceHeader
                    loading={loading}
                    onSave={this.save}
                    onExit={this.cancelEditing}
                    activeTab={activeEditor}
                    disableSave={isSaveGSInstanceDisabled(activeGSInstance, initGSInstance)}
                    onNavChange={onNavChange}/>}
            >
                <EditGSInstanceMain key="main-editor" instance={activeGSInstance} isCreateNew={this.state.isCreateNew} setOption={this.setOption} active={activeEditor === "1"}/>
                <ModalDialog {...modalProps}/>
            </BorderLayout>);
    }
    cancelEditing = () => {
        const {activeGSInstance, initGSInstance, onExitGSInstance} = this.props;
        if (!isGSInstancePristine(activeGSInstance, initGSInstance)) {
            this.setState( () => ({modalProps: {title: "featuregrid.toolbar.saveChanges",
                showDialog: true, buttons: [{
                    text: <Message msgId="no"/>,
                    bsStyle: 'primary',
                    onClick: this.cancel
                },
                {
                    text: <Message msgId="yes"/>,
                    bsStyle: 'primary',
                    onClick: () => {
                        onExitGSInstance();
                    }
                }
                ], closeAction: this.cancel, msg: "map.details.sureToClose"}}));
        } else {
            onExitGSInstance();
        }
    }
    cancel = () => {
        this.setState( () => ({modalProps: {showDialog: false}}));
    }
    save = () => {
        const {activeGSInstance, onSaveGSItance} = this.props;
        if (isGSInstanceValid(activeGSInstance)) {
            onSaveGSItance(activeGSInstance);
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
}
export default GSInstanceEditor;
