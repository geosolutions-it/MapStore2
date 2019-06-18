/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../components/I18N/Message');
const {connect} = require('react-redux');
const {bindActionCreators} = require('redux');

const {
    loadImports,
    createImport, loadImport, runImport, deleteImport,
    uploadImportFiles, loadTask, updateTask, deleteTask,
    updateProgress,
    loadLayer, updateLayer,
    loadTransform, deleteTransform, editTransform, updateTransform,
    loadStylerTool,
    loadWorkspaces,
    selectWorkSpace,
    createWorkspace,
    dismissWorkspaceCreationStatus
} = require('../../actions/importer');

const assign = require('object-assign');
const getURL = function(props) {
    return props.geoserverRestURL || "/geoserver/rest/";
};

/**
 * ImporterPlugin. User Interface for the Importer REST API in GeoServer.
 * Notice: This plugin can be included in a stand-alone page. See `pages/Importer.jsx`
 * @name Importer
 * @memberof plugins.manager
 * @prop {string} [geoserverRestURL] the URL of geoserver rest to use. By default `/geoserver/rest/`
 * @prop {string} defaultPresets the ID of the preset to use
 * @prop {object[]} datastoreTemplates allow to create some datastore when create a new workspace. Typically it can be used to setup the workspace to import vector data in database
 * @prop {object[]} presets: the presets. For the moment only the one with `defaultPresets` ID is used.
 * @example
 * {
 *  "id": "importer",
 *  "defaultPresets": "MY_PRESET", // THE PRESET TO USE. In the future we may support multiple presets
 *  // Template to create the initial data store when a new workspace is created. This helps to import vector data
 *  "datastoreTemplates": [
 *    {
 *      "dataStore": {
 *        "name": "{workspace}_jndi",
 *        "type": "PostGIS (JNDI)",
 *        "enabled": true,
 *        "connectionParameters": {
 *          "entry": [
 *            { "@key": "schema", "$": "terrain"},
 *            { "@key": "Estimated extends", "$": "true"},
 *            { "@key": "Batch insert size", "$": "100"},
 *            { "@key": "preparedStatements", "$": "false"},
 *            { "@key": "fetch size", "$": "1000"},
 *            { "@key": "encode functions", "$": "false"},
 *            { "@key": "jndiReferenceName", "$": "java:comp/env/jdbc/npa"},
 *            { "@key": "Expose primary keys", "$": "true"},
 *            { "@key": "Support on the fly geometry simplification", "$": "true"},
 *            { "@key": "dbtype", "$": "postgis"},
 *            { "@key": "Loose bbox", "$": "true"}
 *          ]
 *        },
 *        "_default": false
 *      }
 *    }
 *  ],
 *  // presets
 *  "presets": {
 *    "MY_PRESET": [
 *      // by default it creates an import in MY_WORKSPACE
 *      {
 *        "import": {
 *          "targetWorkspace": {
 *            "workspace": {
 *              "name": "MY_WORKSPACE"
 *            }
 *          }
 *        }
 *      },
 *      // sample preset for ShapeFile Format. Notice the datastore name is the same of the datastoreTemplates
 *      // So when create a new workspace, you create the datastore, then when upload a shapefile you use it.
 *      {
 *        "state": "READY",
 *        "data": {
 *          "format": "Shapefile"
 *        },
 *        "changes": {
 *          "target": {
 *            "dataStore": {
 *              "name": "{targetWorkspace}_jndi"
 *            }
 *          }
 *        }
 *      },
 *      // sample preset for GeoTIFF format. Add transformChain to the task to optimize GeoTIFF (this are standard transformations)
 *      // to optimize GeoTiffs for web
 *      {
 *        "state": "READY",
 *        "data": {
 *          "format": "GeoTIFF"
 *        },
 *        "changes": {
 *          "task": {
 *            "transformChain": {
 *              "type": "raster",
 *              "transforms": [
 *                {
 *                  "type": "GdalWarpTransform",
 *                  "options": [ "-t_srs", "EPSG:4326", "-co", "TILED=YES", "-co", "BLOCKXSIZE=512", "-co", "BLOCKYSIZE=512"
 *                  ]
 *                },
 *                {
 *                  "type": "GdalAddoTransform",
 *                  "options": [ "-r","average"],
 *                  "levels": [2,4,8,16,32,64,128]
 *                }
 *              ]
 *            }
 *          }
 *        }
 *      }
 *    ]
 *  }
 *}

 */
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
            error: state.importer && state.importer.loadingError,
            taskCreationError: state.importer && state.importer.taskCreationError,
            workspaces: state.importer && state.importer.workspaces,
            selectedWorkSpace: state.importer && state.importer.selectedWorkSpace,
            workspaceCreationStatus: state.importer && state.importer.workspaceCreationStatus
        };
    },
    (dispatch, ownProps) => {
        return bindActionCreators({
            loadImports: loadImports.bind(null, getURL(ownProps)),
            createImport: createImport.bind(null, getURL(ownProps)),
            uploadImportFiles: uploadImportFiles.bind(null, getURL(ownProps) ),
            updateTask: updateTask.bind(null, getURL(ownProps)),
            updateTransform: updateTransform.bind(null, getURL(ownProps)),
            updateProgress: updateProgress.bind(null, getURL(ownProps)),
            loadImport: loadImport.bind(null, getURL(ownProps)),
            runImport: runImport.bind(null, getURL(ownProps)),
            loadTask: loadTask.bind(null, getURL(ownProps)),
            loadTransform: loadTransform.bind(null, getURL(ownProps)),
            editTransform: editTransform,
            deleteTransform: deleteTransform.bind(null, getURL(ownProps)),
            deleteImport: deleteImport.bind(null, getURL(ownProps)),
            deleteTask: deleteTask.bind(null, getURL(ownProps)),
            loadLayer: loadLayer.bind(null, getURL(ownProps)),
            updateLayer: updateLayer.bind(null, getURL(ownProps)),
            loadStylerTool: loadStylerTool.bind(null, getURL(ownProps)),
            loadWorkspaces: loadWorkspaces.bind(null, getURL(ownProps)),
            dismissWorkspaceCreationStatus: dismissWorkspaceCreationStatus,
            selectWorkSpace: selectWorkSpace.bind(null),
            createWorkspace: createWorkspace.bind(null, getURL(ownProps))
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
            title: <Message msgId="importer.title"/>,
            glyph: "import"
        }
    }),
    reducers: {importer: require('../../reducers/importer')}
};
