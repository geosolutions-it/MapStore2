
import React from 'react';
import ResizableModal from '../misc/ResizableModal';
import Portal from '../misc/Portal';
import BorderLayout from '../layout/BorderLayout';
import Toolbar from '../misc/toolbar/Toolbar';


const MediaModal = ({
    show,
    onShow = () => { }
}) => {

    return (
        <Portal>
            <ResizableModal
                title="Media"
                show={show}
                onClose={() => onShow(false)}
                className={`ms-media-modal ms-media-modal-${currentType}`}
                size="lg"
                buttons={[
                    {
                        text: 'Apply',
                        bsSize: 'sm'
                    }
                ]}>
                <BorderLayout
                    className="ms-media-modal-layout"
                    header={
                        <div style={{ padding: 4, zIndex: 2 }} className="shadow-soft">
                            <Toolbar
                                btnDefaultProps={{ bsSize: 'sm' }}
                                buttons={[]} />
                        </div>
                    }
                    columns={[
                        <div style={{ zIndex: 1, order: -1, width: 300, backgroundColor: '#ffffff' }} className="shadow-soft">

                        </div>
                    ]}>
                    <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
                        TODO
                    </div>
                </BorderLayout>
            </ResizableModal>
        </Portal>
    );
};

export default MediaModal;
