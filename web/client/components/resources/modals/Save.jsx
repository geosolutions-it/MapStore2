/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const {get} = require('lodash');
const Portal = require('../../misc/Portal');
const ResizableModal = require('../../misc/ResizableModal');
// require('./css/modals.css');
const {Grid} = require('react-bootstrap');
const Message = require('../../I18N/Message');
const ErrorBox = require('./fragments/ErrorBox');
const MainForm = require('./fragments/MainForm');
const ruleEditor = require('./enhancers/ruleEditor');
const PermissionEditor = ruleEditor(require('./fragments/PermissionEditor'));

/**
 * A Modal window to show map metadata form
*/
class SaveModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        loading: PropTypes.bool,
        errors: PropTypes.array,
        rules: PropTypes.array,
        onSave: PropTypes.func,
        onUpdateRules: PropTypes.func,
        resource: PropTypes.object,
        linkedResources: PropTypes.object,
        style: PropTypes.object,
        modalSize: PropTypes.string,
        // CALLBACKS
        onError: PropTypes.func,
        onUpdate: PropTypes.func,
        onUpdateLinkedResource: PropTypes.func,
        onClose: PropTypes.func,
        metadataChanged: PropTypes.func,
        availablePermissions: PropTypes.arrayOf(PropTypes.string),
        availableGroups: PropTypes.arrayOf(PropTypes.object)
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        id: "MetadataModal",
        modalSize: "",
        resource: {},
        linkedResources: {},
        onUpdateRules: ()=> {},
        metadataChanged: ()=> {},
        metadata: {name: "", description: ""},
        options: {},
        style: {},
        // CALLBACKS
        onClose: () => {},
        onError: ()=> {},
        onUpdate: ()=> {},
        onUpdateLinkedResource: () => {},
        onSave: ()=> {},
        availablePermissions: ["canRead", "canWrite"],
        availableGroups: []
    };
    onCloseMapPropertiesModal = () => {
        this.props.onClose();
    }

    onSave = () => {
        this.props.onSave({...this.props.resource, permission: this.props.rules});
    };

    /**
     * @return the modal for unsaved changes
    */
    render() {
        return (<Portal key="saveDialog">
            {<ResizableModal
                loading={this.props.loading}
                title={<Message msgId="dashboard.saveDialog.title"/>}
                show={this.props.show}
                clickOutEnabled
                bodyClassName="ms-flex modal-properties-container"
                buttons={[{
                    text: <Message msgId="close"/>,
                    onClick: this.onCloseMapPropertiesModal,
                    disabled: this.props.resource.loading
                }, {
                    text: <span><Message msgId="save"/></span>,
                    onClick: () => { this.onSave(); },
                        disabled: !this.isValidForm() || this.props.loading
                }]}
                showClose={!this.props.resource.loading}
                onClose={this.onCloseMapPropertiesModal}>
            <Grid fluid>
                <div className="ms-map-properties">
                    <ErrorBox errors={this.props.errors} />
                    <MainForm
                        resource={this.props.resource}
                        onUpdateLinkedResource={this.props.onUpdateLinkedResource}
                        linkedResources={this.props.linkedResources}
                        onMetadataChanged={this.props.metadataChanged}
                        onError={this.props.onError}
                        onUpdate={this.props.onUpdate} />
                    <PermissionEditor
                        rules={this.props.rules}
                        onUpdateRules={this.props.onUpdateRules}
                        availableGroups={this.props.availableGroups}
                    />
                </div>
            </Grid>
        </ResizableModal>}
    </Portal>);
    }
    isValidForm = () => get(this.props.resource, "metadata.name");
}

module.exports = SaveModal;
