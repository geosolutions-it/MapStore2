/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import AddSection from '../../common/AddSection';
import Content from '../contents/Content';

class Section extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        mode: PropTypes.oneOf(['edit', 'view']),
        contents: PropTypes.array,
        viewHeight: PropTypes.number,
        viewWidth: PropTypes.number,
        excludeClassName: PropTypes.string,
        needsUpdate: PropTypes.number,
        onAdd: PropTypes.func,
        onEdit: PropTypes.func,
        onUpdate: PropTypes.func,
        props: PropTypes.oneOf('view', 'edit')
    };

    static defaultProps = {
        id: '',
        viewHeight: 0,
        viewWidth: 0,
        mode: 'view',
        excludeClassName: 'ms-cascade-section-exclude',
        needsUpdate: -1,
        onUpdate: () => { },
        onEdit: () => {},
        onAdd: () => { }
    };

    state = {
        height: 0
    };

    render() {
        return (
            <div
                className={`ms-cascade-section${this.props.type ? ` ms-${this.props.type}` : ''}`}
                style={{
                    position: 'relative',
                    height: this.state.height,
                    transform: 'translate3d(0px, 0px, 0px)'
                }}>
                {
                    this.props.contents.map(({ id: contentId, type, foreground }) => (
                        <Content
                            type={type}
                            {...foreground}
                            id={contentId}
                            height={this.props.viewHeight}
                            width={this.props.viewWidth}
                            mode={this.props.mode}
                            onChange={(key, value) => this.props.onEdit({ sectionId: this.props.id, contentId, key, value })}
                        />)
                    )
                }
                {!this.props.mode === 'view' && <div
                    className={`${this.props.excludeClassName || ''} ms-cascade-edit-tools text-center`}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        backgroundColor: '#ffffff',
                        width: '100%',
                        zIndex: 2,
                        pointerEvents: 'auto'
                    }}>
                    <AddSection
                        id={this.props.id}
                        type={this.props.type}
                        onAdd={this.props.onAdd} />
                </div>}
            </div>
        );
    }
}

export default Section;
