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
    confirmId={`featuregrid.yesButton"`}
    cancelId={`featuregrid.noButton`}
    preventHide
    titleId={"featuregrid.featureClose"}
    disabled={saving}>
</Confirm></Portal>);
