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
    printCancel
} from '../../actions/print';

import PrintPreviewComp from '../../components/print/PrintPreview';
import PrintSubmitComp from '../../components/print/PrintSubmit';
import ConfigUtils from '../../utils/ConfigUtils';


export const PrintSubmit = connect((state) => ({
    loading: state.print && state.print.isLoading || false
}))(PrintSubmitComp);

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

export const defaultItems = [{
    "name": "PrintTextInput",
    "id": "PrintTitle",
    "override": {
        "Print": {
            "target": "left-panel",
            "position": 1
        }
    },
    "cfg": {
        "property": "name",
        "path": "",
        "label": "print.title",
        "placeholder": "print.titleplaceholder"
    }
}, {
    "name": "PrintTextInput",
    "id": "PrintDescription",
    "override": {
        "Print": {
            "target": "left-panel",
            "position": 2
        }
    },
    "cfg": {
        "property": "description",
        "path": "",
        "label": "print.description",
        "placeholder": "print.descriptionplaceholder",
        "type": "textarea"
    }
}, {
    "name": "PrintLayout",
    "override": {
        "Print": {
            "target": "left-panel-accordion",
            "position": 1
        }
    },
    "cfg": {
        "title": "print.layout"
    }
}, {
    "name": "PrintLegendOptions",
    "override": {
        "Print": {
            "target": "left-panel-accordion",
            "position": 2
        }
    },
    "cfg": {
        "title": "print.legendoptions"
    }
}, {
    "name": "PrintResolution",
    "override": {
        "Print": {
            "target": "right-panel",
            "position": 1
        }
    }
}, {
    "name": "PrintMapPreview",
    "override": {
        "Print": {
            "target": "right-panel",
            "position": 2
        }
    }
}, {
    "name": "PrintOption",
    "id": "DefaultBackgrounOption",
    "override": {
        "Print": {
            "target": "right-panel",
            "position": 3
        }
    },
    "cfg": {
        "enabled": "context.notAllowedLayers",
        "property": "defaultBackground",
        "label": "print.defaultBackground"
    }
}];

export default {
    defaultItems,
    PrintSubmit,
    PrintPreview
};
