import React from 'react';
import Confirm from '../../../layout/ConfirmDialog';
import Portal from '../../../misc/Portal';


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
    titleId={"featuregrid.delete"}
    titleParams={{count: count}}
    disabled={saving}>
</Confirm></Portal>);
