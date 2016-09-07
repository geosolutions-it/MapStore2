/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const {connect} = require('react-redux');
const {bindActionCreators} = require('redux');


const {
    loadImports,
    createImport, loadImport, runImport, deleteImport,
    uploadImportFiles, loadTask, updateTask, deleteTask,
    updateProgress,
    loadLayer, updateLayer,
    loadTransform, deleteTransform,
    loadStylerTool
} = require('../../actions/importer');

const assign = require('object-assign');
const getURL = function(props) {
    return props.geoserverRestURL || "/geoserver/rest/";
};

const ImporterPlugin = connect(
    (state) => {
        return {
            uploading: state.importer && state.importer.uploading,
            loading: state.importer && state.importer.loading,
            geoserverRestURL: state.importer && getURL(state.importer),
            imports: state.importer && state.importer.imports || [],
            selectedImport: state.importer && state.importer.selectedImport,
            selectedTask: state.importer && state.importer.selectedTask,
            selectedTransform: state.importer && state.importer.selectedTransform,
            error: state.importer && state.importer.loadingError
    }; },
    (dispatch, ownProps) => {
        return bindActionCreators({
            loadImports: loadImports.bind(null, getURL(ownProps)),
            createImport: createImport.bind(null, getURL(ownProps)),
            uploadImportFiles: uploadImportFiles.bind(null, getURL(ownProps) ),
            updateTask: updateTask.bind(null, getURL(ownProps)),
            updateProgress: updateProgress.bind(null, getURL(ownProps)),
            loadImport: loadImport.bind(null, getURL(ownProps)),
            runImport: runImport.bind(null, getURL(ownProps)),
            loadTask: loadTask.bind(null, getURL(ownProps)),
            loadTransform: loadTransform.bind(null, getURL(ownProps)),
            deleteTransform: deleteTransform.bind(null, getURL(ownProps)),
            deleteImport: deleteImport.bind(null, getURL(ownProps)),
            deleteTask: deleteTask.bind(null, getURL(ownProps)),
            loadLayer: loadLayer.bind(null, getURL(ownProps)),
            updateLayer: updateLayer.bind(null, getURL(ownProps)),
            loadStylerTool: loadStylerTool.bind(null, getURL(ownProps))
        }, dispatch);
    }, (stateProps, dispatchProps, ownProps) => {
        return assign({}, ownProps, stateProps, dispatchProps, {
                onMount: () => {
                    if (!stateProps.selectedTask && !stateProps.selectedImport) {
                        dispatchProps.loadImports(getURL(ownProps));
                    }
                }
            });
    }
)(require("../../components/manager/importer/Importer"));
module.exports = {
    ImporterPlugin: assign(ImporterPlugin, {
        hide: true,
        Manager: {
            id: "importer",
            name: 'importer',
            position: 1,
            title: 'Import Data',
            glyph: "import"
        }
    }),
    reducers: {importer: require('../../reducers/importer')}
};
