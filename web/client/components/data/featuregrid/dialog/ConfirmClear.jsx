const React = require('react');
const Confirm = require('../../../misc/ConfirmDialog');
const Portal = require('../../../misc/Portal');
const Message = require('../../../I18N/Message');
module.exports = ({
    onClose = () => {},
    saving = false,
    onConfirm = () => {}
} = {}) => (<Portal><Confirm
    draggable={false}
    show
    onClose={onClose}
    onConfirm={onConfirm}
    confirmButtonBSStyle="default"
    closeGlyph="1-close"
    confirmButtonContent={<Message msgId="featuregrid.yesButton" />}
    confirmButtonDisabled={saving}
    closeText={<Message msgId="featuregrid.noButton" />}>
    <Message msgId="featuregrid.clear"/>
</Confirm></Portal>);
