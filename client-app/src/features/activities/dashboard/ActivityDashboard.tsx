import React from "react";
import { Grid, List } from "semantic-ui-react";
import { Activity } from "../../../app/models/Activity";
import ActivityDetails from "../details/ActivityDetails";
import ActivityForm from "../form/ActivityForm";
import ActivityList from "./ActivityList";

interface Props {
  activities: Activity[];
  selectedActivity: Activity | undefined;
  selectActivity: (id: string) => void;
  cancelSelectedActivity: () => void;
  editMode: boolean;
  openForm: (id: string) => void;
  closeForm: () => void;
  createOrEdit: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  submitting:boolean;

}

export default function ActivityDashboard(props: Props) {
  return (
    <Grid>
      <Grid.Column width="10">
        <ActivityList
          activities={props.activities}
          selectActivity={props.selectActivity}
          deleteActivity={props.deleteActivity}
          submitting={props.submitting}
        />
      </Grid.Column>
      <Grid.Column width="6">
        {!props.editMode && props.selectedActivity && (
          <ActivityDetails
            activity={props.selectedActivity}
            cancelSelectedActivity={props.cancelSelectedActivity}
            openForm={props.openForm}
          />
        )}
        {props.editMode && (
          <ActivityForm
            closeForm={props.closeForm}
            activity={props.selectedActivity}
            createOrEdit={props.createOrEdit}
            submitting={props.submitting}
          />
        )}
      </Grid.Column>
    </Grid>
  );
}
