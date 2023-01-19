import { observer } from "mobx-react-lite";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Form, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import { v4 as uuid } from "uuid";
export default observer(function ActivityForm() {
  const { activityStore } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [enteredActivity, setEnteredActivity] = useState({
    id: "",
    title: "",
    date: "",
    description: "",
    category: "",
    city: "",
    venue: "",
  });
  function handleSubmit() {
    if (enteredActivity.id) {
      activityStore.updateActivity(enteredActivity).then(() => {
        navigate(`/activities/${enteredActivity.id}`);
      });
    } else {
      enteredActivity.id = uuid();
      activityStore.createActivity(enteredActivity).then(() => {
        navigate(`/activities/${enteredActivity.id}`);
      });
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setEnteredActivity({ ...enteredActivity, [name]: value });
  }

  useEffect(() => {
    if (id === undefined) {
      setEnteredActivity({
        id: "",
        title: "",
        date: "",
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
              date: "",
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
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Form.Input
          placeholder="Title"
          value={enteredActivity.title}
          name="title"
          onChange={handleInputChange}
        />
        <Form.TextArea
          placeholder="Description"
          value={enteredActivity.description}
          name="description"
          onChange={handleInputChange}
        />
        <Form.Input
          placeholder="Category"
          value={enteredActivity.category}
          name="category"
          onChange={handleInputChange}
        />
        <Form.Input
          type="date"
          placeholder="Date"
          value={enteredActivity.date}
          name="date"
          onChange={handleInputChange}
        />
        <Form.Input
          placeholder="City"
          value={enteredActivity.city}
          name="city"
          onChange={handleInputChange}
        />
        <Form.Input
          placeholder="Venue"
          value={enteredActivity.venue}
          name="venue"
          onChange={handleInputChange}
        />
        <Button
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
    </Segment>
  );
});
