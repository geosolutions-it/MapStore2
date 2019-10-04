const React = require('react');
const {Checkbox} = require('react-bootstrap');
const Message = require('../../I18N/Message');

module.exports = ({
    style = {},
    titleMsg = "featuregrid.columns",
    onChange = () => {},
    attributes = []
} = {}) => (
    <div className="bg-body data-attribute-selector" style={style}>
        <h4 className="text-center"><strong><Message msgId={titleMsg} /></strong></h4>
        <div>
            {attributes.map( attr =>
                (<Checkbox
                    key={attr.attribute || attr.name}
                    checked={!attr.hide}
                    onChange={() => onChange(attr.attribute, !attr.hide ) }>
                    {attr.label || attr.attribute}
                </Checkbox>)
            )}
        </div>
    </div>
);
