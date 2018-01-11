const SET_EDITOR_AVAILABLE = "DASHBOARD:SET_AVAILABLE";
const SET_EDITING = "DASHBOARD:SET_EDITOR_AVAILABLE";
module.exports = {
    SET_EDITING,
    setEditing: (editing) => ({type: SET_EDITING, editing }),
    SET_EDITOR_AVAILABLE,
    setEditorAvailable: available => ({type: SET_EDITOR_AVAILABLE, available})
};
