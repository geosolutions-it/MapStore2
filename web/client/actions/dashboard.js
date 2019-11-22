const SET_EDITOR_AVAILABLE = "DASHBOARD:SET_AVAILABLE";
const SET_EDITING = "DASHBOARD:SET_EDITING";
const SHOW_CONNECTIONS = "DASHBOARD:SHOW_CONNECTIONS";
const TRIGGER_SAVE_MODAL = "DASHBOARD:TRIGGER_SAVE_MODAL";
const TRIGGER_SAVE_AS_MODAL = "DASHBOARD:TRIGGER_SAVE_AS_MODAL";

const SAVE_DASHBOARD = "DASHBOARD:SAVE_DASHBOARD";
const SAVE_ERROR = "DASHBOARD:SAVE_ERROR";
const DASHBOARD_SAVED = "DASHBOARD:DASHBOARD_SAVED";

const LOAD_DASHBOARD = "DASHBOARD:LOAD_DASHBOARD";
const DASHBOARD_RESET = "DASHBOARD:DASHBOARD_RESET";
const DASHBOARD_LOADED = "DASHBOARD:DASHBOARD_LOADED";
const DASHBOARD_LOADING = "DASHBOARD:DASHBOARD_LOADING";
const DASHBOARD_LOAD_ERROR = "DASHBOARD:DASHBOARD_LOAD_ERROR";

module.exports = {
    SET_EDITING,
    setEditing: (editing) => ({type: SET_EDITING, editing }),
    SET_EDITOR_AVAILABLE,
    setEditorAvailable: available => ({type: SET_EDITOR_AVAILABLE, available}),
    SHOW_CONNECTIONS,
    triggerShowConnections: show => ({ type: SHOW_CONNECTIONS, show}),
    TRIGGER_SAVE_MODAL,
    triggerSave: show => ({ type: TRIGGER_SAVE_MODAL, show}),
    TRIGGER_SAVE_AS_MODAL,
    triggerSaveAs: show => ({ type: TRIGGER_SAVE_AS_MODAL, show}),
    SAVE_DASHBOARD,
    saveDashboard: resource => ({ type: SAVE_DASHBOARD, resource}),
    SAVE_ERROR,
    dashboardSaveError: error => ({type: SAVE_ERROR, error}),
    DASHBOARD_SAVED,
    dashboardSaved: id => ({type: DASHBOARD_SAVED, id}),
    LOAD_DASHBOARD,
    loadDashboard: id => ({ type: LOAD_DASHBOARD, id}),
    DASHBOARD_LOADED,
    DASHBOARD_RESET,
    resetDashboard: () => ({ type: DASHBOARD_RESET}),
    dashboardLoaded: (resource, data) => ({ type: DASHBOARD_LOADED, resource, data}),
    DASHBOARD_LOADING,
    /**
     * @param {boolean} value the value of the flag
     * @param {string} [name] the name of the flag to set. loading is anyway always triggered
     */
    dashboardLoading: (value, name = "loading") => ({
        type: DASHBOARD_LOADING,
        name,
        value
    }),
    DASHBOARD_LOAD_ERROR,
    dashboardLoadError: error => ({type: DASHBOARD_LOAD_ERROR, error})
};
