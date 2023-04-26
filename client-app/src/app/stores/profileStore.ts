import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Photo, Profile, UserActivity } from "../models/profile";
import agent from "../api/agent";
import { store } from "./store";

export default class ProfileStore {
  profile: Profile | null = null;
  loadingProfile = false;
  uploading = false;
  loading = false;
  loadingFollowings = false;
  followings: Profile[] | null = null;
  activeTab = 0;
  userActivities: UserActivity[] = [];
  loadingUserActivities = false;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.activeTab,
      (activeTab) => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? "followers" : "following";
          this.getFollowings(predicate);
        } else {
          this.followings = [];
        }
      }
    );
  }

  setActiveTabe = (activeTab: any) => {
    this.activeTab = activeTab;
  };

  get isCurrentUser() {
    if (store.userStore.user && this.profile) {
      return store.userStore.user.username === this.profile.username;
    }
    return false;
  }

  loadProfile = async (username: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(username);
      runInAction(() => {
        this.profile = profile;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loadingProfile = false;
      });
    }
  };

  uploadPhoto = async (file: Blob) => {
    this.uploading = true;

    try {
      const response = await agent.Profiles.uploadPhoto(file);
      const photo = response.data;
      runInAction(() => {
        if (this.profile) {
          this.profile.photos?.push(photo);
          if (photo.isMain && store.userStore.user) {
            store.userStore.setImage(photo.url);
            this.profile.image = photo.url;
          }
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.uploading = false;
      });
    }
  };

  setMainPhoto = async (photo: Photo) => {
    this.loading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      store.userStore.setImage(photo.url);
      runInAction(() => {
        if (this.profile && this.profile.photos) {
          this.profile.photos.find((p) => p.isMain)!.isMain = false;
          this.profile.photos.find((x) => x.id === photo.id)!.isMain = true;
          this.profile.image = photo.url;
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  deletePhoto = async (photo: Photo) => {
    this.loading = true;
    try {
      await agent.Profiles.deletePhoto(photo.id);

      runInAction(() => {
        if (this.profile) {
          this.profile.photos = this.profile.photos?.filter(
            (p) => p.id !== photo.id
          );
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  updateFollowing = async (targetUsername: string) => {
    this.loading = true;
    try {
      if (targetUsername !== store.userStore.user?.username) {
        await agent.Profiles.updateFollowing(targetUsername);
        if (this.activeTab !== 0) {
          await this.loadProfile(store.userStore.user!.username);
          if (this.activeTab === 3 || this.activeTab === 4) {
            const predicate = this.activeTab === 3 ? "followers" : "following";
            this.getFollowings(predicate);
          }
        }
        store.activityStore.updateAttendeeFollowing(targetUsername);
      }
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  getFollowings = async (predicate: string) => {
    this.loadingFollowings = true;
    try {
      const profiles = await agent.Profiles.getFollowers(
        this.profile!.username,
        predicate
      );
      runInAction(() => {
        this.followings = profiles;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loadingFollowings = false;
      });
    }
  };

  loadUserActivities = async (username: string, predicate?: string) => {
    this.loadingUserActivities = true;
    try {
      const userActivities = await agent.Profiles.getUserActivities(
        username,
        predicate!
      );
      runInAction(() => {
        this.userActivities = userActivities;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loadingUserActivities = false;
      });
    }
  };
}
