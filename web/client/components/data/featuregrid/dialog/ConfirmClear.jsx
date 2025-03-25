import React from 'react';
import Confirm from '../../../layout/ConfirmDialog';
import Portal from '../../../misc/Portal';


export default ({
    onClose = () => {},
    saving = false,
    onConfirm = () => {}
} = {}) => (<Portal><Confirm
    show
    onCancel={onClose}
    onConfirm={onConfirm}
    variant="danger"
    titleId={"featuregrid.clear"}
    confirmId={`featuregrid.yesButton`}
    cancelId={`featuregrid.noButton`}
    disabled={saving}>
</Confirm></Portal>);
