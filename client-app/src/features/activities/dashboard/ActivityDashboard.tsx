import React, { useEffect, useState } from "react";
import { Grid, Loader } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import ActivityList from "./ActivityList";
import { observer } from "mobx-react-lite";
import ActivityFilter from "./ActivityFilter";
import { PagingParam } from "../../../app/models/pagination";
import InfiniteScroll from "react-infinite-scroller";
import ActivityListItemPlaceholder from "./ActivityListItemPlaceHolder";

export default observer(function ActivityDashboard() {
  const { activityStore } = useStore();
  const [loadingNext, setLoadingNext] = useState(false);

  function handleGetNext() {
    setLoadingNext(true);
    activityStore.setPagingParams(
      new PagingParam(activityStore.pagination!.CurrentPage + 1)
    );
    activityStore.LoadActivitites().then(() => setLoadingNext(false));
  }

  useEffect(() => {
    activityStore.LoadActivitites();
  }, [activityStore]);

  return (
    <Grid>
      <Grid.Column width="10">
        {activityStore.loadingInitial && !loadingNext ? (
          <>
            <ActivityListItemPlaceholder />
            <ActivityListItemPlaceholder />
          </>
        ) : (
          <InfiniteScroll
            pageStart={0}
            loadMore={handleGetNext}
            hasMore={
              !loadingNext &&
              !!activityStore.pagination &&
              activityStore.pagination!.CurrentPage <
                activityStore.pagination!.totalPages
            }
            initialLoad={false}
          >
            <ActivityList />
          </InfiniteScroll>
        )}
      </Grid.Column>
      <Grid.Column width="6">
        <ActivityFilter />
      </Grid.Column>
      <Grid.Column width={10}>
        <Loader active={loadingNext} />
      </Grid.Column>
    </Grid>
  );
});
