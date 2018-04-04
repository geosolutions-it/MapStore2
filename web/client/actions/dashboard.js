const SET_EDITOR_AVAILABLE = "DASHBOARD:SET_AVAILABLE";
const SET_EDITING = "DASHBOARD:SET_EDITING";
const SHOW_CONNECTIONS = "DASHBOARD:SHOW_CONNECTIONS";
module.exports = {
    SET_EDITING,
    setEditing: (editing) => ({type: SET_EDITING, editing }),
    SET_EDITOR_AVAILABLE,
    setEditorAvailable: available => ({type: SET_EDITOR_AVAILABLE, available}),
    SHOW_CONNECTIONS,
    triggerShowConnections: show => ({ type: SHOW_CONNECTIONS, show})
};
