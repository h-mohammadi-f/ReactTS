import { format } from "date-fns";
import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity, ActivityFormValues } from "../models/Activity";
import { store } from "./store";
import { Profile } from "../models/profile";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();

  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInitial = false;

  constructor() {
    // makeObservable(this, {
    //   title: observable,
    //   setTitle: action,
    // });

    //we can ue above approach, but we use auto observable to write less code:

    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => a.date!.getTime() - b.date!.getTime()
    );
  }

  get groupedActivities() {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const date = format(activity.date!, "dd MMM yyyy");
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
  }

  //because we use it in effect and that function returns promise, we can make this function async
  LoadActivitites = async () => {
    this.setLoadingInitial(true);

    try {
      const localActivities = await agent.Activities.list();
      //because we want to change immutable object and using asyn, we need to put the code in runinaction.
      // runInAction(() => {
      //   localActivities.forEach((activity) => {
      //     activity.date = activity.date.split("T")[0];
      //     this.activities.push(activity); //we can do it in Mobx because it can manpulate immutable but redux no.
      //   });
      //   this.loadingInitial = false;
      // });

      //because we do not want to use run in action, we create another method to update loadingInitial.
      localActivities.forEach((activity) => {
        this.setActivity(activity);
      });
      this.setLoadingInitial(false);
    } catch (error) {
      console.log(error);
      this.setLoadingInitial(false);
    }
  };

  private setActivity = (activity: Activity) => {
    //for populating extra information
    const user = store.userStore.user;
    if (user) {
      activity.isGoing = activity.attendees!.some(
        (a) => a.username === user.username
      );
      activity.isHost = activity.hostUsername === user.username;
      activity.host = activity.attendees?.find(
        (x) => x.username === activity.hostUsername
      );
    }
    // activity.date = activity.date.split("T")[0];
    activity.date = new Date(activity.date!);
    //we want to use map
    //this.activities.push(activity); //we can do it in Mobx because it can manpulate immutable but redux no.
    this.activityRegistry.set(activity.id, activity);
  };

  loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      runInAction(() => {
        this.selectedActivity = activity;
      });
    } else {
      this.setLoadingInitial(true);
      try {
        activity = await agent.Activities.details(id);
        this.setActivity(activity);
        runInAction(() => {
          this.selectedActivity = activity;
        });
        this.setLoadingInitial(false);
      } catch (error) {
        console.log(error);
        this.setLoadingInitial(false);
      }
    }
  };

  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  setLoadingInitial = (state: boolean) => {
    this.loadingInitial = state;
  };

  // selectActivity = (id: string) => {
  //   // this.selectedActivity = this.activities.find((x) => x.id === id);
  //   this.selectedActivity = this.activityRegistry.get(id);
  // };

  // cancelSelectedActivity = () => {
  //   this.selectedActivity = undefined;
  // };

  // openForm = (id?: string) => {
  //   id ? this.selectActivity(id) : this.cancelSelectedActivity();
  //   this.editMode = true;
  // };

  // closeForm = () => {
  //   this.editMode = false;
  // };

  createActivity = async (activity: ActivityFormValues) => {
    const user = store.userStore.user;
    const attendee = new Profile(user!);
    try {
      await agent.Activities.create(activity);
      const newActivity = new Activity(activity);
      newActivity.hostUsername = user!.username;
      newActivity.attendees = [attendee];
      this.setActivity(newActivity);
      runInAction(() => {
        // this.activities.push(activity);
        this.selectedActivity = newActivity;
      });
    } catch (error) {
      console.log(error);
    }
  };

  updateActivity = async (activity: ActivityFormValues) => {
    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        if (activity.id) {
          let updatedActivity = {
            ...this.getActivity(activity.id),
            ...activity,
          };
          this.activityRegistry.set(activity.id, updatedActivity as Activity);
          this.selectedActivity = updatedActivity as Activity;
        }
        // this.activities = [
        //   ...this.activities.filter((a) => a.id !== activity.id),
        //   activity,
        // ];
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  deleteActivity = async (id: string) => {
    this.loading = true;

    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        // this.activities = [...this.activities.filter((a) => a.id !== id)];
        this.activityRegistry.delete(id);
        // if (this.selectedActivity?.id === id) this.cancelSelectedActivity();
        this.loading = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  updateAttendance = async () => {
    const user = store.userStore.user;
    this.loading = true;
    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity?.isGoing) {
          this.selectedActivity.attendees =
            this.selectedActivity.attendees?.filter(
              (a) => a.username !== user?.username
            );
          this.selectedActivity.isGoing = false;
        } else {
          const attendee = new Profile(user!);
          this.selectedActivity?.attendees?.push(attendee);
          this.selectedActivity!.isGoing = true;
        }
        this.activityRegistry.set(
          this.selectedActivity!.id,
          this.selectedActivity!
        );
        this.loading = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  cancelActivityToggle = async () => {
    this.loading = true;
    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        this.selectedActivity!.isCancelled =
          !this.selectedActivity!.isCancelled;
        this.activityRegistry.set(
          this.selectedActivity!.id,
          this.selectedActivity!
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  clearSelectedActivity = ()=>{
    this.selectedActivity = undefined;
  }
}
