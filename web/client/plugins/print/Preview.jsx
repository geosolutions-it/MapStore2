import React, {useState} from "react";
import PDFPrintPreview from '../../components/print/PrintPreview';
import {Button, Glyphicon} from "react-bootstrap";
import Message from "../../components/I18N/Message";

const defaultSupportedFormats = ["png", "jpg", "bmp", "gif", "jpeg"];

/**
 * Component that shows the given remote image (url), in the given format.
 * Includes buttons to:
 *  - hide the preview (back)
 *  - zoom in/out
 *  - download the image
 * @param {object} cfg configuration object
 * @param {string} cfg.url url of the remote image to preview
 * @param {string} cfg.format format of the remote image to preview
 * @param {string} cfg.buttonStyle bootstrap style for buttons
 * @param {int} cfg.maxPreviewZoom max zoom supported (defaults to 5)
 * @param {function} cfg.back handler for the back / hide button
 * @param {string[]} cfg.supportedFormats list of formats that can be previewed (for other formats a warning message is shown), defaults to "png", "jpg", "bmp", "gif", "jpeg"
 */
export const ImagePreview = ({downloadUrl, format, buttonStyle, back, maxPreviewZoom = 5, supportedFormats = defaultSupportedFormats}) => {
    const [zoom, setZoom] = useState(1);
    const zoomIn = () => {
        setZoom((z) => z + 1);
    };
    const zoomOut = () => {
        setZoom((z) => z - 1);
    };
    const isSupported = supportedFormats.indexOf(format) !== -1;
    return (
        <div id="mapstore-image-print-preview-panel">
            {isSupported ? <div className="mapstore-print-preview-img-wrapper">
                <img src={downloadUrl} style={{transform: `scale(${zoom})`, transformOrigin: "top left"}}/>
            </div> : <Message msgId="print.previewFormatUnsupported"/>}
            <div style={{marginTop: "10px"}}>
                <Button bsStyle={buttonStyle} style={{marginRight: "10px"}} onClick={back}><Glyphicon glyph="arrow-left"/></Button>
                <Button bsStyle={buttonStyle} disabled={!isSupported || zoom >= maxPreviewZoom} onClick={zoomIn}><Glyphicon glyph="zoom-in"/></Button>
                <Button bsStyle={buttonStyle} disabled={!isSupported || zoom <= 1} onClick={zoomOut}><Glyphicon glyph="zoom-out"/></Button>
                <label style={{marginLeft: "10px", marginRight: "10px"}}>{zoom}x</label>
                <div className={"print-download btn btn-" + buttonStyle}><a href={downloadUrl} target="_blank"><Glyphicon glyph="save"/></a></div>
            </div>
        </div>
    );
};

/**
 * Print Preview component combining a generic image format preview, with
 * a specialized PDF viewer.
 *
 * One or the other are chosen based on the outputFormat property.
 *
 * @param {string} cfg.outputFormat format of the content to preview (pdf / others)
 */
export default ({outputFormat, ...props}) => {
    return outputFormat === "pdf" ? (
        <PDFPrintPreview {...props}/>
    ) : <ImagePreview format={outputFormat} {...props}/>;
};
