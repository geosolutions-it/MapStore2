import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Fields from './Fields';
import { describeFeatureType } from '../../../../observables/wfs';

/**
 * Utility function to check if the node allows to show fields tab
 * @param {object} node the node of the TOC (including layer properties)
 * @returns {boolean} true if the node allows to show fields
 */
export const hasFields = ({type, search = {}} = {}) =>
    type === 'wfs' // pure WFS layer
        || (type === 'wms' && search.type === 'wfs'); // WMS backed by WFS (search)

/**
 * Load the fields of a layer and automatically remap the old fields to the new fields
 * @param {object} layer the layer. Contains the type and the information to load the fields, and the old fields to remap
 * @param {boolean} merge true to merge the old fields with the new fields (if the name of the field is the same)
 * @returns {Promise} a promise that resolves with the new fields
 */
export const loadFields = (layer, merge = true) => {
    const {fields = [], type, search = {}} = layer;
    const {typeName} = search;
    if (type === 'wfs' || (type === 'wms' && search.type === 'wfs')) {
        return describeFeatureType({ layer }).toPromise().then((response) => {
            const { featureTypes } = response?.data ?? {};
            const featureType = featureTypes.find(({name}) => name === typeName);
            const {properties} = featureType;
            return properties.map(({name, localType}) => {
                const field = merge && fields.find((ff) => ff.name === name) || {};
                return {
                    ...field,
                    name,
                    type: localType
                };
            });
        });
    }
    return Promise.resolve([]);
};

/**
 * Component to show the fields of a layer and to edit the alias of the fields
 * @prop {object} layer the layer. Contains the `type` and the information to load the fields, and the `fields` to show and edit, if present
 * @prop {function} updateFields function to update the fields of the layer. It receives the new `fields` as parameter as well as fields of the layer changed.
 * @memberof components.TOC
 */
const LayerFields = ({ layer, updateFields = () => {}, ...props }) => {
    const [fields, setFields] = useState(layer.fields ?? []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    const onChange = (name, attribute, value) => {
        const newFields = fields.map((field) => {
            if (field.name === name) {
                return {
                    ...field,
                    [attribute]: value
                };
            }
            return field;
        });
        setFields(newFields);
    };
    const onLoadFields = (merge) => {
        setError();
        setLoading(true);
        loadFields(layer, merge)
            .then((newFields) => {
                if (mounted.current) {
                    setLoading(false);
                    setFields(newFields);
                }
            })
            .catch((e) => {
                if (mounted.current) {
                    setLoading(false);
                    setError(e);
                }
            });
    };
    const onClear = () => {
        setFields([]);
        // these are the old fields.
        if (fields.length > 0) {
            setTimeout(() => onLoadFields(false), 100);
        }

    };
    // autoload the fields if empty
    useEffect(() => {
        if (fields.length === 0) {
            onLoadFields();
        }
    }, []);
    // save in layer the fields when they change
    useEffect(() => {
        if (fields.length > 0) {
            updateFields(fields);
        }
    }, [fields]);

    return <Fields {...props} fields={fields} onChange={onChange} onLoadFields={onLoadFields} onClear={onClear} loading={loading} error={error} />;
};

LayerFields.propTypes = {
    layer: PropTypes.object,
    updateFields: PropTypes.func
};

export default LayerFields;
