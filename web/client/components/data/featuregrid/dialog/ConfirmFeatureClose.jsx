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
    confirmId={`featuregrid.yesButton"`}
    cancelId={`featuregrid.noButton`}
    preventHide
    titleId={<Message msgId="featuregrid.featureClose"/>}
    disabled={saving}>
</Confirm></Portal>);
