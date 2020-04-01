const {createSelector} = require('reselect');
const {pathnameSelector} = require('../selectors/router');

const isDashboardAvailable = state => state && state.dashboard && state.dashboard.editor && state.dashboard.editor.available;
const isShowSaveOpen = state => state && state.dashboard && state.dashboard.showSaveModal;
const isShowSaveAsOpen = state => state && state.dashboard && state.dashboard.showSaveAsModal;
const isDashboardEditing = state => state && state.dashboard && state.dashboard.editing;
const showConnectionsSelector = state => state && state.dashboard && state.dashboard.showConnections;
const dashboardResource = state => state && state.dashboard && state.dashboard.resource;
const isDashboardLoading = state => state && state.dashboard && state.dashboard.loading;
const getDashboardSaveErrors = state => state && state.dashboard && state.dashboard.saveErrors;
const isBrowserMobile = state => state && state.browser && state.browser.mobile;
const buttonCanEdit = createSelector(pathnameSelector, dashboardResource, isBrowserMobile,
    (path, resource, isMobile) => isMobile ? !isMobile : (resource && resource.canEdit || isNaN(path.substr(-4))));

module.exports = {
    isDashboardAvailable,
    isShowSaveOpen,
    isShowSaveAsOpen,
    isDashboardEditing,
    showConnectionsSelector,
    dashboardResource,
    isDashboardLoading,
    getDashboardSaveErrors,
    isBrowserMobile,
    buttonCanEdit
};
