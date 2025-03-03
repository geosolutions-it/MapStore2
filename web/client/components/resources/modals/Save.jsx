/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { lazy } from 'react';
import { Grid } from 'react-bootstrap';
import isEqual from 'lodash/isEqual';

import Message from '../../I18N/Message';
import Portal from '../../misc/Portal';
import ResizableModal from '../../misc/ResizableModal';
import ruleEditor from './enhancers/ruleEditor';

import ErrorBox from './fragments/ErrorBox';
import MainForm from './fragments/MainForm';
import PermissionEditorComp from './fragments/PermissionEditor';

import withSuspense from '../../misc/withSuspense';
const DetailsComp = withSuspense()(lazy(() => import('./fragments/Details')));

const PermissionEditor = ruleEditor(PermissionEditorComp);

/**
 * Defines if the resource permissions are available or not.
 * Actually GeoStore allow editing of the permission to the owner or to the administrators.
 * For new resources the owner (will be) the current user so if owner is missing (as for new resources),
 * this returns true.
 * @param {object} user the user object, with role and name properties
 * @param {object} resource the resource object, with attributes (owner)
 */
const canEditResourcePermission = (user = {}, resource) => {
    // anonymous users can not edit
    if (!user) {
        return false;
    }
    const { role, name } = user;
    if (role === 'ADMIN') {
        return true;
    }
    // if owner is present, permissions are editable only by him
    const owner = resource && resource.attributes && resource.attributes.owner;
    if (owner) {
        return owner === name;
    }
    return true;
};
/**
 * A Modal window to show map metadata form
 * @deprecated
 */
class SaveModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        loading: PropTypes.bool,
        title: PropTypes.string,
        clickOutEnabled: PropTypes.bool,
        canSave: PropTypes.bool, // check if resource can be saved
        errors: PropTypes.array,
        rules: PropTypes.array,
        enableFileDrop: PropTypes.bool,
        saveButtonLabel: PropTypes.string,
        onSave: PropTypes.func,
        acceptedDropFileName: PropTypes.string,
        fileDropLabel: PropTypes.string,
        fileDropStatus: PropTypes.string,
        fileDropErrorMessage: PropTypes.element,
        fileDropClearMessage: PropTypes.element,
        onUpdateRules: PropTypes.func,
        nameFieldFilter: PropTypes.func,
        resource: PropTypes.object,
        linkedResources: PropTypes.object,
        style: PropTypes.object,
        modalSize: PropTypes.string,
        enableDetails: PropTypes.bool,
        detailsComponent: PropTypes.func,
        detailsEditor: PropTypes.string,
        detailsEditorProps: PropTypes.object,
        // CALLBACKS
        onError: PropTypes.func,
        onUpdate: PropTypes.func,
        onUpdateLinkedResource: PropTypes.func,
        onClose: PropTypes.func,
        onFileDrop: PropTypes.func,
        onFileDropClear: PropTypes.func,
        metadataChanged: PropTypes.func,
        disablePermission: PropTypes.bool,
        availablePermissions: PropTypes.arrayOf(PropTypes.string),
        availableGroups: PropTypes.arrayOf(PropTypes.object),
        user: PropTypes.object,
        dialogClassName: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        id: "MetadataModal",
        title: "saveDialog.title",
        saveButtonLabel: "save",
        modalSize: "",
        resource: {},
        linkedResources: {},
        onUpdateRules: ()=> {},
        nameFieldFilter: () => {},
        metadataChanged: ()=> {},
        metadata: {name: "", description: ""},
        options: {},
        style: {},
        // CALLBACKS
        onClose: () => {},
        onError: ()=> {},
        onUpdate: ()=> {},
        onUpdateLinkedResource: () => {},
        onDeleteLinkedResource: () => {},
        onSave: ()=> {},
        disablePermission: false,
        availablePermissions: ["canRead", "canWrite"],
        availableGroups: [],
        canSave: true,
        user: {},
        dialogClassName: '',
        detailsComponent: require('./enhancers/handleDetails').default((DetailsComp))
    };

    componentDidUpdate(prevProps) {
        if (
            this.props.errors &&
            this.props.errors.length > 0 &&
            !isEqual(this.props.errors, prevProps.errors) &&
            this.state?.loading
        ) {
            this.setState({ loading: false });  // eslint-disable-line -- TODO: need to be fixed
        }
    }

    onCloseMapPropertiesModal = () => {
        this.props.onClose();
    }

    onSave = () => {
        this.setState({loading: true});
        this.props.onSave({...this.props.resource, permission: this.props.rules});
    };

    /**
     * @return the modal for unsaved changes
    */
    render() {
        const canEditPermission = !this.props.disablePermission && canEditResourcePermission(this.props.user, this.props.resource);
        const Details = this.props.detailsComponent;

        return (<Portal key="saveDialog">
            <ResizableModal
                loading={this.props.loading || this.state?.loading}
                title={<Message msgId={this.props.title}/>}
                show={this.props.show}
                clickOutEnabled={this.props.clickOutEnabled}
                bodyClassName="ms-flex modal-properties-container"
                fitContent={this.props.disablePermission}
                dialogClassName={this.props.dialogClassName}
                buttons={[{
                    text: <Message msgId="close"/>,
                    onClick: this.onCloseMapPropertiesModal,
                    disabled: this.isLoading()
                }, {
                    text: <span><Message msgId={this.props.saveButtonLabel}/></span>,
                    onClick: () => { this.onSave(); },
                    disabled: this.isSaveDisabled()
                }]}
                showClose={!this.isLoading()}
                onClose={this.onCloseMapPropertiesModal}>
                <Grid fluid>
                    <div className="ms-map-properties">
                        <ErrorBox errors={this.props.errors} />
                        <MainForm
                            resource={this.props.resource}
                            onUpdateLinkedResource={this.props.onUpdateLinkedResource}
                            linkedResources={this.props.linkedResources}
                            enableFileDrop={this.props.enableFileDrop}
                            acceptedDropFileName={this.props.acceptedDropFileName}
                            fileDropLabel={this.props.fileDropLabel}
                            fileDropStatus={this.props.fileDropStatus}
                            fileDropErrorMessage={this.props.fileDropErrorMessage}
                            fileDropClearMessage={this.props.fileDropClearMessage}
                            onMetadataChanged={this.props.metadataChanged}
                            onFileDrop={this.props.onFileDrop}
                            onFileDropClear={this.props.onFileDropClear}
                            onError={this.props.onError}
                            nameFieldFilter={this.props.nameFieldFilter}
                            onUpdate={this.props.onUpdate} />
                        {this.props.enableDetails && <Details
                            editor={this.props.detailsEditor}
                            editorProps={this.props.detailsEditorProps}
                            loading={this.props.loading}
                            resource={this.props.resource}
                            linkedResources={this.props.linkedResources}
                            onUpdateResource={this.props.onUpdate}
                            onUpdateLinkedResource={this.props.onUpdateLinkedResource}/>
                        }
                        {
                            !!canEditPermission &&  <PermissionEditor
                                rules={this.props.rules}
                                onUpdateRules={this.props.onUpdateRules}
                                availableGroups={this.props.availableGroups}
                            />
                        }
                    </div>
                </Grid>
            </ResizableModal>
        </Portal>);
    }
    isValidForm = () =>
        get(this.props.resource, "metadata.name") &&
        (!this.props.enableFileDrop || this.props.fileDropStatus === "accepted");

    isLoading = () => {
        return (
            this.props.loading || this.props.resource?.loading || this.state?.loading
        );
    };

    isSaveDisabled = () => {
        return !this.isValidForm() || this.isLoading() || !this.props.canSave;
    };
}

export default SaveModal;
