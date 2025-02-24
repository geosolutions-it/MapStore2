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
    variant="danger"
    titleId={<Message msgId="featuregrid.clear"/>}
    confirmId={`featuregrid.yesButton`}
    cancelId={`featuregrid.noButton`}
    disabled={saving}>
</Confirm></Portal>);
