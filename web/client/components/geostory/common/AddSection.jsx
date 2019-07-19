import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

import Toolbar from '../../misc/toolbar/Toolbar';
import ToolbarPopover from './ToolbarPopover';
import sectionTemplates from './sectionTemplates';

class AddSection extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        onAdd: PropTypes.func
    };

    static defaultProps = {
        id: '',
        type: '',
        onAdd: () => { }
    };

    render() {
        return (
            <ToolbarPopover
                ref={(popover) => {
                    if (popover) this.trigger = popover.trigger;
                }}
                glyph="plus text-primary"
                container={document.querySelector('#ms-parallax-container')}
                placement="top"
                content={
                    <Toolbar
                        btnDefaultProps={{
                            className: 'square-button btn-tray'
                        }}
                        buttons={[
                            {
                                glyph: 'font',
                                tooltip: 'Add title section',
                                onClick: () => {
                                    this.props.onAdd({
                                        id: this.props.id,
                                        section: sectionTemplates('title')
                                    });
                                    this.trigger.hide();
                                }
                            },
                            {
                                glyph: 'sheet',
                                tooltip: 'Add paragraph section',
                                onClick: () => {
                                    this.props.onAdd({
                                        id: this.props.id,
                                        section: sectionTemplates('paragraph')
                                    });
                                    this.trigger.hide();
                                }
                            },
                            {
                                glyph: this.props.type === 'immersive' ? 'picture' : 'book',
                                tooltip: this.props.type === 'immersive' ? 'Add immersive content' : 'Add immersive section',
                                onClick: () => {
                                    if (!(this.props.type === 'immersive')) {
                                        this.props.onAdd({
                                            id: this.props.id,
                                            section: sectionTemplates('immersive')
                                        });
                                    } else {
                                        this.props.onAdd({
                                            id: this.props.id,
                                            content: sectionTemplates('immersiveContent')
                                        });
                                    }
                                    this.trigger.hide();
                                }
                            }
                        ]} />
                }>
                <Glyphicon
                    glyph="plus"
                    className="text-primary"
                    style={{ padding: 8 }} />
            </ToolbarPopover>
        );
    }
}

export default AddSection;
