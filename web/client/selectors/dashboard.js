const {createSelector} = require('reselect');
const {pathnameSelector} = require('../selectors/routing');

const isDashboardAvailable = state => state && state.dashboard && state.dashboard.editor && state.dashboard.editor.available;
const isShowSaveOpen = state => state && state.dashboard && state.dashboard.showSaveModal;
const isDashboardEditing = state => state && state.dashboard && state.dashboard.editing;
const showConnectionsSelector = state => state && state.dashboard && state.dashboard.showConnections;
const dashboardResource = state => state && state.dashboard && state.dashboard.resource;
const isDashboardLoading = state => state && state.dashboard && state.dashboard.loading;
const getDashboardSaveErrors = state => state && state.dashboard && state.dashboard.saveErrors;
const buttonCanEdit = createSelector(pathnameSelector, dashboardResource,
    (path, resource) => resource && resource.canEdit || isNaN(path.substr(-4)));

module.exports = {
    isDashboardAvailable,
    isShowSaveOpen,
    isDashboardEditing,
    showConnectionsSelector,
    dashboardResource,
    isDashboardLoading,
    getDashboardSaveErrors,
    buttonCanEdit
};
