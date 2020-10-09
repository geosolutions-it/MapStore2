/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { Grid, Row, Col } = require('react-bootstrap');
const { isString } = require('lodash');
const ResourceCard = require('./ResourceCard');
const Spinner = require('react-spinkit');
const DetailsSheet = require('./modals/fragments/DetailsSheet').default;

const renderLoading = () => {
    return <div style={{ width: "100px", overflow: "visible", margin: "auto" }}>Loading...<Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /></div>;
};

const renderMetadataModal = ({ Component, edit, resource, setEdit, errors, setErrors, onSaveSuccess, user,
    nameFieldFilter, enableDetails, category, onResourceLoad }) => {
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
            resource={resource}
            category={category}
            enableDetails={enableDetails}
            onResourceLoad={onResourceLoad}/>);
    }
    return null;
};

module.exports = ({
    fluid,
    className,
    colProps,
    loading,
    category = 'MAP',
    resources = [],
    resource,
    detailsText,
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
    showDetailsSheet,
    onEdit = () => {},
    onEditData = () => {},
    setEdit = () => {},
    setErrors = () => {},
    onSaveSuccess = () => {},
    onDelete = () => {},
    onShare = () => {},
    onUpdateAttribute = () => {},
    onShowDetailsSheet = () => {},
    onHideDetailsSheet = () => {},
    onResourceLoad = () => {},
    nameFieldFilter = () => {}
}) => {
    const categoryName = (isString(resource?.category) ? resource?.category : resource?.category?.name) || category;

    return (
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
                                onShowDetailsSheet={onShowDetailsSheet}
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
                nameFieldFilter,
                category: categoryName,
                enableDetails: categoryName === 'MAP',
                onResourceLoad
                // resource
            })}
            <DetailsSheet
                loading={loading}
                show={showDetailsSheet}
                readOnly
                title={resource?.name || resource?.metadata?.name}
                detailsText={detailsText}
                onClose={onHideDetailsSheet}/>
        </Grid>
    );
};
