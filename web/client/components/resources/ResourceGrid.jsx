/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { Grid, Row, Col } = require('react-bootstrap');
const ResourceCard = require('./ResourceCard');
const Spinner = require('react-spinkit');

const renderLoading = () => {
    return <div style={{ width: "100px", overflow: "visible", margin: "auto" }}>Loading...<Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /></div>;
};

const renderMetadataModal = ({ Component, edit, resource, setEdit, errors, setErrors, onSaveSuccess, user, nameFieldFilter }) => {
    if (Component) {
        let MetadataModal = Component;
        return (<MetadataModal
            key="metadataModal"
            user={user}
            setEdit={setEdit}
            show={edit}
            setErrors={setErrors}
            errors={errors}
            onSaveSuccess={onSaveSuccess}
            nameFieldFilter={nameFieldFilter}
            resource={resource} />);
    }
    return null;
};

module.exports = ({
    fluid,
    className,
    colProps,
    loading,
    resources = [],
    resource,
    id,
    style,
    bottom,
    title,
    metadataModal,
    viewerUrl,
    edit,
    errors,
    user,
    editDataEnabled,
    shareToolEnabled,
    cardTooltips,
    onEdit = () => {},
    onEditData = () => {},
    setEdit = () => {},
    setErrors = () => {},
    onSaveSuccess = () => {},
    onDelete = () => {},
    onShare = () => {},
    onUpdateAttribute = () => {},
    nameFieldFilter = () => {}
}) => (
    <Grid id={id} fluid={fluid} className={'ms-grid-container ' + className} style={style}>
        {title && <Row>
            {title}
        </Row>}
        <Row className="ms-grid">
            {loading && resources.length === 0
                ? renderLoading()
                : resources.map(
                    res => (<Col key={res.id} {...colProps}>
                        <ResourceCard
                            viewerUrl={viewerUrl}
                            resource={res}
                            editDataEnabled={editDataEnabled}
                            shareToolEnabled={shareToolEnabled}
                            onEdit={onEdit}
                            onEditData={onEditData}
                            onDelete={onDelete}
                            onShare={onShare}
                            tooltips={cardTooltips}
                            onUpdateAttribute={onUpdateAttribute} />
                    </Col>))
            }
        </Row>
        {bottom}
        {renderMetadataModal({
            Component: metadataModal,
            user,
            onSaveSuccess,
            resource,
            setErrors,
            errors,
            setEdit,
            edit,
            nameFieldFilter
            // resource
        })}
    </Grid>
);
