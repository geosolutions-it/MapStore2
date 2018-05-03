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

const renderMetadataModal = ({ Component, edit, resource, setEdit, onSaveSuccess, user }) => {
    if (Component) {
        let MetadataModal = Component;
        return (<MetadataModal user={user} setEdit={setEdit} key="metadataModal" show={edit} onSaveSuccess={onSaveSuccess}
            resource={resource} />);
    }
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
    user,
    onEdit = () => {},
    setEdit = () => {},
    onSaveSuccess = () => {},
    onDelete = () => {},
    onUpdateAttribute = () => {}
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
                                onEdit={onEdit}
                                onDelete={onDelete}
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
                setEdit,
                edit
                // resource
        })}
    </Grid>
);
