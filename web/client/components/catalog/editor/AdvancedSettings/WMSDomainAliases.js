import {FormControl, FormGroup, Col, ControlLabel, Glyphicon, Button} from "react-bootstrap";
import {debounce, size, map, omit, toInteger} from "lodash";
import Message from "../../../I18N/Message";
import InfoPopover from "../../../widgets/widget/InfoPopover";
import React, {useState, useCallback, useEffect} from "react";

/**
 * @name WMSDomainAliases
 * @param onChangeServiceProperty
 * @param service {Object}
 * @returns {JSX.Element}
 */
export default ({
    onChangeServiceProperty = () => {},
    service
}) => {
    const [aliases, setAliases] = useState(size(service.domainAliases) ? service.domainAliases : { 0: ''});
    const [key, setKey] = useState(1);

    const onDomainAliasChangeDebounced = useCallback(
        debounce((values) => {
            onChangeServiceProperty('domainAliases', values);
        }, 300),
        []
    );

    useEffect(() => {
        onDomainAliasChangeDebounced(aliases);
        return () => {};
    }, [aliases]);

    const onChange = (k) => ({ target }) => setAliases((a) => ({...a, [k]: target.value}));
    const onRemoveAlias = (k) => () => setAliases((a) => ({...omit(a, [k])}));
    const onCreateAlias = () => {
        setKey((k) => k + 1);
        setAliases((a) => ({...a, [key]: ''}));
    };

    const elements = map(aliases, (el, k) => (
        <Col xs={12} className="form-group alias-item">
            <FormControl id={`alias-${k}`} key={`alias-${k}`} type="text" value={el} onChange={onChange(k)}/>
            {toInteger(k) !== 0 &&
            <Button className="remove-alias" onClick={onRemoveAlias(k)}>
                <Glyphicon glyph="minus" />
            </Button>
            }
        </Col>
    ));

    return (
        <FormGroup controlId="domain-aliases" key="domain-aliases" className="mapstore-catalog-domain-aliases">
            <Col xs={12}>
                <ControlLabel>Domain Aliases</ControlLabel>
                &nbsp;
                <InfoPopover text={<Message msgId="catalog.enableLocalizedLayerStyles.tooltip" />} />
            </Col>
            {elements}
            <Col xs={12}>
                <Button className="add-alias" tooltip={"Add alias"} onClick={onCreateAlias}>
                    <Glyphicon glyph={"plus"} />
                </Button>
            </Col>
        </FormGroup>
    );
};
