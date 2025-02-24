import React from 'react';
import Confirm from '../../../layout/ConfirmDialog';
import Portal from '../../../misc/Portal';
import Message from '../../../I18N/Message';

export default ({
    onClose = () => {},
    saving = false,
    count,
    onConfirm = () => {}
} = {}) => (<Portal><Confirm
    show
    onCancel={onClose}
    onConfirm={onConfirm}
    variant="danger"
    confirmId={`featuregrid.deleteButton`}
    cancelId={`featuregrid.noButton`}
    preventHide
    titleId={<Message msgId="featuregrid.delete" msgParams={{count: count}}/>}
    disabled={saving}>
</Confirm></Portal>);
