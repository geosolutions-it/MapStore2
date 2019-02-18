const React = require('react');
const Confirm = require('../../../misc/ConfirmDialog');
const Portal = require('../../../misc/Portal');
const Message = require('../../../I18N/Message');
module.exports = ({
    onClose = () => {},
    saving = false,
    count,
    onConfirm = () => {}
} = {}) => (<Portal><Confirm
    show
    onClose={onClose}
    onConfirm={onConfirm}
    confirmButtonBSStyle="default"
    closeGlyph="1-close"
    confirmButtonContent={<Message msgId="featuregrid.deleteButton" />}
    confirmButtonDisabled={saving}>
    <Message msgId="featuregrid.delete" msgParams={{count: count}}/>
</Confirm></Portal>);
