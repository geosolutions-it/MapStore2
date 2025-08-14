import React from "react";

import FlexBox from "../../../components/layout/FlexBox";
import Button from "../../../components/layout/Button";
import Message from "../../../components/I18N/Message";
import Loader from "../../../components/misc/Loader";

const ItineraryAction = ({
    onHandleRun,
    locations,
    itineraryLoading,
    onHandleReset
}) => {
    return (
        <FlexBox className="itinerary-run" gap="sm">
            <Button onClick={onHandleReset}><Message msgId="itinerary.reset" /></Button>
            <Button
                className={"run-btn"}
                variant="primary"
                disabled={locations?.length < 2 || itineraryLoading}
                onClick={onHandleRun}
            >
                <Message msgId="itinerary.run" />{itineraryLoading ? <Loader size={12} /> : null}
            </Button>
        </FlexBox>
    );
};

ItineraryAction.defaultProps = {
    locations: [],
    itineraryLoading: false,
    onHandleRun: () => {},
    onHandleReset: () => {}
};

export default ItineraryAction;
