/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';

import { setControlProperty } from '../../actions/controls';
import {
    printCancel,
    setPrintParameter,
    changeMapPrintPreview,
    changePrintZoomLevel
} from '../../actions/print';

import ConfigUtils from '../../utils/ConfigUtils';

import {TextInput} from "./TextInput";
import {Option} from "./Option";
import {ActionButton} from './ActionButton';

import {Layout as LayoutComp} from "./Layout";
import {LegendOptions as LegendOptionsComp} from "./LegendOptions";
import {Resolution as ResolutionComp} from "./Resolution";
import {MapPreview as MapPreviewComp} from "./MapPreview";

import Preview from "./Preview";

export const Name = connect((state) => ({
    spec: state.print?.spec || {},
    additionalProperty: false,
    property: "name",
    path: "",
    type: "text",
    label: "print.title",
    placeholder: "print.titleplaceholder"
}), {
    onChangeParameter: setPrintParameter
})(TextInput);

export const Description = connect((state) => ({
    spec: state.print?.spec || {},
    additionalProperty: false,
    property: "description",
    path: "",
    type: "textarea",
    label: "print.description",
    placeholder: "print.descriptionplaceholder"
}), {
    onChangeParameter: setPrintParameter
})(TextInput);

export const Layout = connect((state) => ({
    spec: state.print?.spec || {},
    layouts: state?.print?.capabilities?.layouts || []
}), {
    onChangeParameter: setPrintParameter
})(LayoutComp);

export const LegendOptions = connect((state) => ({
    spec: state.print?.spec || {}
}), {
    onChangeParameter: setPrintParameter
})(LegendOptionsComp);

export const Resolution = connect((state) => ({
    spec: state.print?.spec || {},
    items: state?.print?.capabilities?.dpis?.map((dpi) => ({
        name: dpi.name + ' dpi',
        value: dpi.value
    })) ?? []
}), {
    onChangeParameter: setPrintParameter
})(ResolutionComp);

export const MapPreview = connect(
    (state) => ({
        capabilities: state.print?.capabilities ?? {}
    }), {
        onChangeZoomLevel: changePrintZoomLevel,
        onMapViewChanges: changeMapPrintPreview
    }
)(MapPreviewComp);

export const DefaultBackgrounOption = connect((state) => ({
    spec: state?.print?.spec || {},
    enabled: "context.notAllowedLayers",
    path: "",
    property: "defaultBackground",
    additionalProperty: false,
    label: "print.defaultBackground"
}), {
    onChangeParameter: setPrintParameter
})(Option);

export const PrintSubmit = connect((state) => ({
    spec: state?.print?.spec || {},
    loading: state.print && state.print.isLoading || false,
    text: "print.submit",
    action: "print",
    enabled: "context.layout",
    className: "print-submit"
}))(ActionButton);

export const PrintPreview = connect((state) => ({
    url: state.print && ConfigUtils.getProxiedUrl(state.print.pdfUrl),
    downloadUrl: state.print && state.print.pdfUrl,
    scale: state.controls && state.controls.print && state.controls.print.viewScale || 0.5,
    currentPage: state.controls && state.controls.print && state.controls.print.currentPage || 0,
    pages: state.controls && state.controls.print && state.controls.print.pages || 1,
    outputFormat: state.print?.spec?.outputFormat || "pdf"
}), {
    back: printCancel,
    setPage: setControlProperty.bind(null, 'print', 'currentPage'),
    setPages: setControlProperty.bind(null, 'print', 'pages'),
    setScale: setControlProperty.bind(null, 'print', 'viewScale')
})(Preview);

export const standardItems = {
    "left-panel": [{
        id: "name",
        plugin: Name,
        cfg: {},
        position: 1
    }, {
        id: "description",
        plugin: Description,
        cfg: {},
        position: 2
    }],
    "left-panel-accordion": [{
        id: "layout",
        plugin: Layout,
        cfg: {
            "title": "print.layout"
        },
        position: 1
    }, {
        id: "legend-options",
        plugin: LegendOptions,
        cfg: {
            "title": "print.legendoptions"
        },
        position: 2
    }],
    "right-panel": [{
        id: "resolution",
        plugin: Resolution,
        cfg: {},
        position: 1
    }, {
        id: "map-preview",
        plugin: MapPreview,
        cfg: {},
        position: 2
    }, {
        id: "default-background-ignore",
        plugin: DefaultBackgrounOption,
        cfg: {},
        position: 3
    }],
    "buttons": [{
        id: "submit",
        plugin: PrintSubmit,
        cfg: {},
        position: 1
    }],
    "preview-panel": [{
        id: "printpreview",
        plugin: PrintPreview,
        cfg: {},
        position: 1
    }]
};

export default {
    standardItems
};
