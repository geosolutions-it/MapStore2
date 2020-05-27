import React from 'react';
import PropTypes from 'prop-types';
import {Col, Grid, Row, Glyphicon} from "react-bootstrap";
import Filter from '../../misc/Filter';
import Message from '../../I18N/Message';
import ConfirmButton from '../../buttons/ConfirmButton';
import SideCard from '../../misc/cardgrids/SideCard';
import withLocal from "../../misc/enhancers/localizedProps";
import Toolbar from "../../misc/toolbar/Toolbar";
const FilterLocalized = withLocal('filterPlaceholder')(Filter);
// BookmarkList.propTypes = {
//
// };

const BookmarkList = (props) => {
    const {filter = "", onFilter, onPropertyChange, bookmarks = []} = props;
    console.log("BookmarkList", props);

    const edit = (s, idx) => {
        onPropertyChange("bookmark", s);
        onPropertyChange("editIdx", idx);
        onPropertyChange("page", 1);
    };

    const remove = (idx) => {
        const newBookmarks = bookmarks.filter((el, i) => i !== idx);
        onPropertyChange("bookmarkSearchConfig", {bookmarks: newBookmarks});
    };

    const filterBookmark = (bookmarkTitle) =>{
        return bookmarkTitle && bookmarkTitle.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    };

    const getBookmarks = () => {
        if (bookmarks.length === 0) {
            return (<div className="search-service-name">
                <Message msgId="search.bookmarkslistempty"/>
            </div>);
        }
        return bookmarks.map((s, idx) => {
            if (filterBookmark(s.title)) {
                return (
                    <SideCard
                        preview={<Glyphicon glyph="bookmark"/>}
                        title={<span onClick={()=> edit(s, idx)} style={{margin: "6px 0px"}}>{s && s.title}</span>}
                        size="sm"
                        tools={
                            <Toolbar
                                btnDefaultProps={{
                                    className: 'square-button-md no-border'
                                }}
                                btnGroupProps={{
                                    style: {
                                        margin: 10
                                    }
                                }}
                                buttons={[
                                    {
                                        glyph: 'pencil',
                                        tooltipId: "search.editBookmark",
                                        onClick: () => edit(s, idx)
                                    },
                                    {
                                        glyph: 'trash',
                                        tooltipId: "search.deleteBookmark",
                                        onClick: () => remove(idx)
                                    }

                                ]}/>
                        }/>
                );
            }
            return null;
        });
    };

    return (
        <Grid fluid className="ms-header" style={{ width: '100%', boxShadow: 'none'}}>
            <Row>
                <Col xs={12} style={{padding: 0}}>
                    <FilterLocalized
                        filterPlaceholder={"search.bookmarkFilter"}
                        filterText={filter}
                        onFilter={onFilter} />
                </Col>
            </Row>
            <Row>
                {getBookmarks()}
            </Row>
        </Grid>
    );
};

export default {Element: BookmarkList, validate: true};
