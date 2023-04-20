import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityDetailedChat from "./ActivityDetailedChat";
import ActivityDetailedHeader from "./ActivityDetailedHeader";
import ActivityDetailedInfo from "./ActivityDetailedInfo";
import ActivityDetailedSidebar from "./ActivityDetailedSidebar";

export default observer(function ActivityDetails() {
  const { activityStore } = useStore();

  const activity = activityStore.selectedActivity;
  const loadActivity = activityStore.loadActivity;
  // const loadingInitial = activityStore.loadingInitial;
  const { id } = useParams(); //it is a hook which reads passed parameters to this page

  //because id can be null we should use useEffects

  useEffect(() => {
    if (id) {
      loadActivity(id);
    }
    return () => activityStore.clearSelectedActivity();
  }, [id, activityStore, loadActivity]);

  if (!activity) return <LoadingComponent />;

  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityDetailedHeader activity={activity} />
        <ActivityDetailedInfo activity={activity} />
        <ActivityDetailedChat activityId={activity.id} />
      </Grid.Column>
      <Grid.Column width={6}>
        <ActivityDetailedSidebar activity={activity!} />
      </Grid.Column>
    </Grid>
  );
});
