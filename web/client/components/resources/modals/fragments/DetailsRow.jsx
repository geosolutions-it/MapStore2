const React = require('react');
const {Row, Col} = require('react-bootstrap');
const Spinner = require('react-spinkit');
const { isNil } = require('lodash');
const Toolbar = require('../../../misc/toolbar/Toolbar');

const Message = require('../../../I18N/Message');
const { NO_DETAILS_AVAILABLE } = require('../../../../actions/maps');


module.exports = ({
    saving,
    hideGroupProperties,
    editDetailsDisabled,
    detailsText,
    detailsBackup,
    onToggleGroupProperties = () => { },
    onUndoDetails = () => { },
    onToggleDetailsSheet = () => { },
    onUpdateDetails = () => { }
}) => {
    return (
        <div className={"ms-section" + (hideGroupProperties ? ' ms-transition' : '')}>
            <div className="mapstore-block-width">
                <Row>
                    <Col xs={6}>
                        <div className="m-label">
                            {detailsText === "" ? <Message msgId="map.details.add" /> : <Message msgId="map.details.rowTitle" />}
                        </div>
                    </Col>
                    <Col xs={6}>
                        <div className="ms-details-sheet">
                            <div className="pull-right">
                                {saving ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : null}
                                {isNil(detailsText) ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : <Toolbar
                                    btnDefaultProps={{ className: 'square-button-md no-border' }}
                                    buttons={[
                                        {
                                            glyph: !hideGroupProperties ? 'eye-close' : 'eye-open',
                                            visible: !!detailsText,
                                            onClick: () => { onToggleGroupProperties(); },
                                            disabled: saving,
                                            tooltipId: !hideGroupProperties ? "map.details.showPreview" : "map.details.hidePreview"
                                        }, {
                                            glyph: 'undo',
                                            tooltipId: "map.details.undo",
                                            visible: !!detailsBackup,
                                            onClick: () => { onUndoDetails(detailsBackup); },
                                            disabled: saving
                                        }, {
                                            glyph: 'pencil-add',
                                            tooltipId: "map.details.add",
                                            visible: !detailsText,
                                            onClick: () => {
                                                onToggleDetailsSheet(false);
                                            },
                                            disabled: saving
                                        }, {
                                            glyph: 'pencil',
                                            tooltipId: "map.details.edit",
                                            visible: !!detailsText && !editDetailsDisabled,
                                            onClick: () => {
                                                onToggleDetailsSheet(false);
                                                if (detailsText) {
                                                    onUpdateDetails(detailsText, true);
                                                }
                                            },
                                            disabled: saving
                                        }, {
                                            glyph: 'trash',
                                            tooltipId: "map.details.delete",
                                            visible: !!detailsText,
                                            onClick: () => { this.props.detailsSheetActions.onDeleteDetails(); },
                                            disabled: saving
                                        }]} />}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            {detailsText && <div className="ms-details-preview-container">
                {detailsText !== NO_DETAILS_AVAILABLE ? <div className="ms-details-preview" dangerouslySetInnerHTML={{ __html: detailsText }} />
                    : <div className="ms-details-preview"> <Message msgId="maps.feedback.noDetailsAvailable" /></div>}
            </div>}
        </div>
    );
};
