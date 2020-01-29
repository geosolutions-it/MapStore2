import React, {useRef, useEffect, useState} from "react";
import { connect } from "react-redux";
import { createPlugin, loadPlugin, importPlugin} from "../../../utils/PluginsUtils";
import axios from "../../../libs/ajax";
import Dropzone from 'react-dropzone';

const availableExtensions = ['Example', 'Test'];

const dropZoneStyle = {
    borderStyle: "dashed",
    borderWidth: "3px",
    transition: "all 0.3s ease-in-out"
};
const dropZoneActiveStyle = {
    backgroundColor: "#eee",
    borderWidth: "5px",
    boxShadow: "0px 0px 25px 14px #d9edf7"
};

const Lazy = ({ onLoad, onRemove, onChangeStatus, loaded, toRestore = [] }) => {
    const inputEl = useRef();
    const [chunks, setChunks] = useState("");

    const loadLazy = (name, paths, status) => {
        const path = paths["extensions/index"];
        const version = path.js.split(/\./)[1];
        const pluginUrl = "lazy/" + name.toLowerCase() + "." + version + ".chunk.js";
        loadPlugin(pluginUrl).then(({declaredName, plugin}) => {
            onLoad(declaredName || name, plugin, status);
        });
    };

    const uploadExtension = (files) => {
        files.forEach(file => {
            let reader = new FileReader();
            reader.onload = function() {
                const source = reader.result;
                importPlugin(source, (name, plugin) => {
                    onLoad(name, plugin, 'INSTALLED', source);
                });
            };
            reader.readAsText(file);
        });
    };

    useEffect(() => {
        // axios.get(window.mapStoreDist + "webpack-assets.json").then(response => {
        axios.get("webpack-assets.json").then(response => {
            setChunks(response.data);
            toRestore.forEach(e => {
                if (e.uploaded) {
                    importPlugin(e.uploaded, (name, plugin) => {
                        onLoad(name, plugin, e.status, e.uploaded);
                    });
                } else {
                    loadLazy(e.name, response.data, e.status);
                }
            });
        });
    }, []);

    const notLoadedExtensions = availableExtensions.filter(e => loaded.filter(l => l.name === e).length === 0);

    const nextStatus = (status) => ({
        "INSTALLED": "ACTIVE",
        "ACTIVE": "SHOWN",
        "SHOWN": "INSTALLED"
    }[status]);

    const renderExtensions = (extensions) =>
        extensions.map(e => (<div>
            <span style={{ display: "inline-block", width: "100px" }}>{e.name}</span>
            <button onClick={() => onChangeStatus(e.name, nextStatus(e.status))}>{e.status}</button>
            {e.status === 'INSTALLED' && <button onClick={() => onRemove(e.name)}>x</button>}
        </div>));

    return (<div style={{ zIndex: 1000, position: "absolute", backgroundColor: "white", minHeight: "150px" }}>
        <div>
            <select style={{ display: "inline-block", width: "100px" }} ref={(el) => { inputEl.current = el; }}>
                {notLoadedExtensions.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button onClick={() => loadLazy(inputEl.current.value, chunks)}>Load and install</button>
            <Dropzone
                key="dropzone"
                rejectClassName="alert-danger"
                className="alert alert-info"
                style={dropZoneStyle}
                activeStyle={dropZoneActiveStyle}
                onDrop={uploadExtension}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center"
                }}>
                    <span style={{
                        width: "100px",
                        height: "100px",
                        textAlign: "center"
                    }}>
                        Drop extension bundle...
                    </span>
                </div>
            </Dropzone>
        </div>
        <div>ADMIN PANEL:</div>
        {renderExtensions(loaded.filter(e => e.status === 'INSTALLED'))}
        <div>USER PANEL:</div>
        {renderExtensions(loaded.filter(e => e.status !== 'INSTALLED'))}
    </div>);
};

export default createPlugin('Lazy', {
    component: connect((state) => ({
        loaded: state.lazy.loaded,
        toRestore: state.lazy.toRestore
    }), {
        onLoad: (name, plugin, status = 'INSTALLED', uploaded = false) => {
            return {
                type: 'LOAD_EXTENSION',
                payload: {
                    name,
                    plugin,
                    status: status,
                    uploaded
                }
            };
        },
        onRemove: (name) => {
            return {
                type: 'REMOVE_EXTENSION',
                name
            };
        },
        onChangeStatus: (name, status) => {
            return {
                type: 'CHANGE_EXTENSION_STATUS',
                name,
                status
            };
        }
    })(Lazy),
    reducers: {
        lazy: (state = { loaded: [] }, action) => {
            if (action.type === 'LOAD_EXTENSION') {
                return { ...state, loaded: [...state.loaded, action.payload], toRestore: state.toRestore.filter(e => e.name !== action.payload.name) };
            }
            if (action.type === 'REMOVE_EXTENSION') {
                return { ...state, loaded: state.loaded.filter(e => e.name !== action.name)};
            }
            if (action.type === 'CHANGE_EXTENSION_STATUS') {
                return {
                    ...state, loaded: state.loaded.map(e => e.name !== action.name ? e : {
                        ...e,
                        status: action.status
                    })
                };
            }
            return state;
        }
    }
});
