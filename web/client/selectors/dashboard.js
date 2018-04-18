const isDashboardAvailable = state => state && state.dashboard && state.dashboard.editor && state.dashboard.editor.available;
const isShowSaveOpen = state => state && state.dashboard && state.dashboard.showSaveModal;
const isDashboardEditing = state => state && state.dashboard && state.dashboard.editing;
const showConnectionsSelector = state => state && state.dashboard && state.dashboard.showConnections;
const dashboardResource = state => state && state.dashboard && state.dashboard.resource;
const isDashboardLoading = state => state && state.dashboard && state.dashboard.loading;
const getDashboardSaveErrors = state => state && state.dashboard && state.dashboard.saveErrors;
module.exports = {
    isDashboardAvailable,
    isShowSaveOpen,
    isDashboardEditing,
    showConnectionsSelector,
    dashboardResource,
    isDashboardLoading,
    getDashboardSaveErrors
};
