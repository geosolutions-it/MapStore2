module.exports = {
    isDashboardAvailable: state => state && state.dashboard && state.dashboard.editor && state.dashboard.editor.available,
    editingSelector: state => state && state.dashboard && state.dashboard.editing
};
