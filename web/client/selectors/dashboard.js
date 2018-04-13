const isDashboardAvailable = state => state && state.dashboard && state.dashboard.editor && state.dashboard.editor.available;
const isShowSaveOpen = state => state && state.dashboard && state.dashboard.showSaveModal;
const isDashboardEditing = state => state && state.dashboard && state.dashboard.editing;
const showConnectionsSelector = state => state && state.dashboard && state.dashboard.showConnections;
const dashboardMetadata = state => state && state.dashboard && state.dashboard.metadata;
module.exports = {
    isDashboardAvailable,
    isShowSaveOpen,
    isDashboardEditing,
    showConnectionsSelector,
    dashboardMetadata
};
