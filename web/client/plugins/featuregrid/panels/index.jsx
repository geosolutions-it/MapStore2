const React = require('react');
const {connect} = require('react-redux');
const {bindActionCreators} = require('redux');
const {createSelector, createStructuredSelector} = require('reselect');
const {paginationInfo, featureLoadingSelector} = require('../../../selectors/query');
const {getTitleSelector, modeSelector, selectedFeaturesCount, hasChangesSelector, hasGeometrySelector, isSimpleGeomSelector, hasNewFeaturesSelector, isSavingSelector, isSavedSelector, isDrawingSelector, canEditSelector} = require('../../../selectors/featuregrid');
const {isAdminUserSelector} = require('../../../selectors/security');
const {deleteFeatures, toggleTool, clearChangeConfirmed, closeFeatureGridConfirmed} = require('../../../actions/featuregrid');
const {closeResponse} = require('../../../actions/wfsquery');
const {toolbarEvents, pageEvents} = require('../index');

const EmptyRowsView = connect(createStructuredSelector({
    loading: featureLoadingSelector
}))(require('../../../components/data/featuregrid/EmptyRowsView'));
const Toolbar = connect(
    createStructuredSelector({
        saving: isSavingSelector,
        saved: isSavedSelector,
        mode: modeSelector,
        hasChanges: hasChangesSelector,
        hasNewFeatures: hasNewFeaturesSelector,
        hasGeometry: hasGeometrySelector,
        isDrawing: isDrawingSelector,
        isSimpleGeom: isSimpleGeomSelector,
        selectedCount: selectedFeaturesCount,
        disableToolbar: state => state && state.featuregrid && state.featuregrid.disableToolbar,
        isDownloadOpen: state => state && state.controls && state.controls.wfsdownload && state.controls.wfsdownload.enabled,
        isColumnsOpen: state => state && state.featuregrid && state.featuregrid.tools && state.featuregrid.tools.settings,
        isEditingAllowed: (state) => isAdminUserSelector(state) || canEditSelector(state)
    }),
    (dispatch) => ({events: bindActionCreators(toolbarEvents, dispatch)})
)(require('../../../components/data/featuregrid/toolbars/Toolbar'));


const Header = connect(
    createSelector(
        getTitleSelector,
        (title) => ({title})),
    {
        onClose: toolbarEvents.onClose
    }
)(require('../../../components/data/featuregrid/Header'));

// loading={props.featureLoading} totalFeatures={props.totalFeatures} resultSize={props.resultSize}/
const Footer = connect(
        createSelector(
            createStructuredSelector(paginationInfo),
            featureLoadingSelector,
            (pagination, loading) => ({
                ...pagination,
                loading
            })),
    pageEvents
)(require('../../../components/data/featuregrid/Footer'));
const DeleteDialog = connect(
    createSelector(selectedFeaturesCount, (count) => ({count})), {
    onClose: () => toggleTool("deleteConfirm", false),
    onConfirm: () => deleteFeatures()
})(require('../../../components/data/featuregrid/dialog/ConfirmDelete'));
const ClearDialog = connect(
    createSelector(selectedFeaturesCount, (count) => ({count})), {
    onClose: () => toggleTool("clearConfirm", false),
    onConfirm: () => clearChangeConfirmed()
})(require('../../../components/data/featuregrid/dialog/ConfirmClear'));
const FeatureCloseDialog = connect(() => {}
    , {
    onClose: () => closeFeatureGridConfirmed(),
    onConfirm: () => closeResponse()
})(require('../../../components/data/featuregrid/dialog/ConfirmFeatureClose'));

const panels = {
    settings: require('./AttributeSelector')
};

const dialogs = {
    deleteConfirm: DeleteDialog,
    featureCloseConfirm: FeatureCloseDialog,
    clearConfirm: ClearDialog
};
const panelDefaultProperties = {
    settings: {
        style: { padding: '0 12px', overflow: "auto", flex: "0 0 14em", boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.4)", height: "100%", minWidth: 195}
    }
};

module.exports = {
    getPanels: (tools = {}) =>
        Object.keys(tools)
            .filter(t => tools[t] && panels[t])
            .map(t => {
                const Panel = panels[t];
                return <Panel key={t} {...(panelDefaultProperties[t] || {})} />;
            }),
    getHeader: () => {
        return <Header ><Toolbar /></Header>;
    },
    getFooter: (props) => {
        return (props.focusOnEdit && props.hasChanges || props.newFeatures.length > 0) ? null : <Footer />;
    },
    getEmptyRowsView: () => {
        return EmptyRowsView;
    },
    getDialogs: (tools = {}) => {
        return Object.keys(tools)
            .filter(t => tools[t] && dialogs[t])
            .map(t => {
                const Dialog = dialogs[t];
                return <Dialog key={t} />;
            });
    }
};
