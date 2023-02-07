import { observer } from "mobx-react-lite";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import { v4 as uuid } from "uuid";
import { Form, Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryOptions } from "../../../app/common/options/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";
import { Activity } from "../../../app/models/Activity";

export default observer(function ActivityForm() {
  const { activityStore } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [enteredActivity, setEnteredActivity] = useState<Activity>({
    id: "",
    title: "",
    date: null,
    description: "",
    category: "",
    city: "",
    venue: "",
  });

  const validationSchema = Yup.object({
    title: Yup.string().required("The activity title is required"),
    description: Yup.string().required("The activity description is required"),
    category: Yup.string().required(),
    date: Yup.string().required('Date is required').nullable(),
    venue: Yup.string().required(),
    city: Yup.string().required(),
  });

  function handleFormSubmit(activity: Activity) {
    if (enteredActivity.id) {
      activityStore.updateActivity(activity).then(() => {
        navigate(`/activities/${activity.id}`);
      });
    } else {
      enteredActivity.id = uuid();
      activityStore.createActivity(activity).then(() => {
        navigate(`/activities/${activity.id}`);
      });
    }
  }

  // function handleChange(
  //   event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) {
  //   const { name, value } = event.target;
  //   setEnteredActivity({ ...enteredActivity, [name]: value });
  // }

  useEffect(() => {
    if (id === undefined) {
      setEnteredActivity({
        id: "",
        title: "",
        date: null,
        description: "",
        category: "",
        city: "",
        venue: "",
      });
    } else {
      activityStore.loadActivity(id).then(() => {
        const activity = activityStore.selectedActivity;
        const initialState = activity
          ? activity
          : {
              id: "",
              title: "",
              date: null,
              description: "",
              category: "",
              city: "",
              venue: "",
            };
        setEnteredActivity(initialState);
      });
    }
  }, [id, setEnteredActivity, activityStore]);

  if (activityStore.loadingInitial)
    return <LoadingComponent content="loading activity..." />;

  return (
    <Segment clearing>
      <Header content="Activity Details" sub color="teal" />
      <Formik
        validationSchema={validationSchema}
        enableReinitialize
        initialValues={enteredActivity}
        onSubmit={(values) => handleFormSubmit(values)}
      >
        {({ handleSubmit, isValid, isSubmitting, dirty }) => (
          <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
            <MyTextInput name="title" placeholder="Title" />
            <MyTextArea rows={3} placeholder="Description" name="description" />
            <MySelectInput
              options={categoryOptions}
              placeholder="Category"
              name="category"
            />
            <MyDateInput
              placeholderText="Date"
              name="date"
              showTimeSelect
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
            <Header content="Location Details" sub color="teal" />
            <MyTextInput placeholder="City" name="city" />
            <MyTextInput placeholder="Venue" name="venue" />
            <Button
              disabled={isSubmitting || !isValid || !dirty}
              loading={activityStore.loading}
              floated="right"
              positive
              type="submit"
              content="Submit"
            />
            <Button
              // onClick={activityStore.closeForm}
              as={Link}
              to="/activities"
              floated="right"
              type="button"
              content="Cancel"
            />
          </Form>
        )}
      </Formik>
    </Segment>
  );
});
