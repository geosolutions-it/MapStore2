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

import PrintPreviewComp from '../../components/print/PrintPreview';
import ConfigUtils from '../../utils/ConfigUtils';

import {TextInput} from "./TextInput";
import {Option} from "./Option";
import {ActionButton} from './ActionButton';

import {Layout as LayoutComp} from "./Layout";
import {LegendOptions as LegendOptionsComp} from "./LegendOptions";
import {Resolution as ResolutionComp} from "./Resolution";
import {MapPreview as MapPreviewComp} from "./MapPreview";

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
        map: state.print?.map,
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
    scale: state.controls && state.controls.print && state.controls.print.viewScale || 0.5,
    currentPage: state.controls && state.controls.print && state.controls.print.currentPage || 0,
    pages: state.controls && state.controls.print && state.controls.print.pages || 1
}), {
    back: printCancel,
    setPage: setControlProperty.bind(null, 'print', 'currentPage'),
    setPages: setControlProperty.bind(null, 'print', 'pages'),
    setScale: setControlProperty.bind(null, 'print', 'viewScale')
})(PrintPreviewComp);

export const standardItems = {
    "left-panel": [{
        plugin: Name,
        cfg: {},
        target: "left-panel",
        position: 1
    }, {
        plugin: Description,
        cfg: {},
        target: "left-panel",
        position: 2
    }],
    "left-panel-accordion": [{
        plugin: Layout,
        cfg: {
            "title": "print.layout"
        },
        target: "left-panel-accordion",
        position: 1
    }, {
        plugin: LegendOptions,
        cfg: {
            "title": "print.legendoptions"
        },
        target: "left-panel-accordion",
        position: 2
    }],
    "right-panel": [{
        plugin: Resolution,
        cfg: {},
        target: "right-panel",
        position: 1
    }, {
        plugin: MapPreview,
        cfg: {},
        target: "right-panel",
        position: 2
    }, {
        plugin: DefaultBackgrounOption,
        cfg: {},
        target: "right-panel",
        position: 3
    }],
    "buttons": [{
        plugin: PrintSubmit,
        cfg: {},
        target: "buttons",
        position: 1
    }],
    "preview-panel": [{
        plugin: PrintPreview,
        cfg: {},
        target: "preview-panel",
        position: 1
    }]
};

export default {
    standardItems,
    PrintPreview
};
