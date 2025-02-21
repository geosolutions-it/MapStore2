import React from 'react';
import Confirm from '../../../layout/ConfirmDialog';
import Portal from '../../../misc/Portal';
import Message from '../../../I18N/Message';

export default ({
    onClose = () => {},
    saving = false,
    onConfirm = () => {}
} = {}) => (<Portal><Confirm
    show
    onCancel={onClose}
    onConfirm={onConfirm}
    variant="success"
    confirmId="yes"
    cancelId="no"
    disabled={saving}>
    <Message msgId="featuregrid.clear"/>
</Confirm></Portal>);
