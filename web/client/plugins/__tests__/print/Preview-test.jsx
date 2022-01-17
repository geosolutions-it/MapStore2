import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";

import Preview from "../../print/Preview";
import { getByXPath } from '../pluginsTestUtils';

describe('Print Preview', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it("pdf preview", () => {
        ReactDOM.render(<Preview outputFormat="pdf"/>, document.getElementById("container"));
        expect(document.getElementById("mapstore-print-preview-panel")).toExist();
    });

    it("supported image preview", () => {
        ReactDOM.render(<Preview outputFormat="png" url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="/>, document.getElementById("container"));
        expect(document.getElementById("mapstore-image-print-preview-panel")).toExist();
        expect(getByXPath("//img")).toExist();
    });

    it("unsupported image preview", () => {
        ReactDOM.render(<Preview outputFormat="tiff" url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="/>, document.getElementById("container"));
        expect(document.getElementById("mapstore-image-print-preview-panel")).toExist();
        expect(getByXPath("//img")).toNotExist();
        expect(getByXPath("//*[text()='print.previewFormatUnsupported']")).toExist();
    });
});
