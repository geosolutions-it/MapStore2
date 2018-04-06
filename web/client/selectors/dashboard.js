const isDashboardAvailable = state => state && state.dashboard && state.dashboard.editor && state.dashboard.editor.available;
const isDashboardEditing = state => state && state.dashboard && state.dashboard.editing;
const showConnectionsSelector = state => state && state.dashboard && state.dashboard.showConnections;

module.exports = {
    isDashboardAvailable,
    isDashboardEditing,
    showConnectionsSelector
};
