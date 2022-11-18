using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Activities;
using Domain;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<List<Activity>>> GetActivities()
        {
            return await Mediator.Send(new List.Query());
        }

        [HttpGet("{id}")] // activities/id
        public async Task<ActionResult<Activity>> GetActivity(Guid id)
        {
            return await Mediator.Send(new Details.Query { ID = id });
        }
        [HttpPost] // activities/id
        public async Task<ActionResult> CreateActivity(Activity activity)
        {
            return Ok(await Mediator.Send(new Create.Command { Activity = activity }));
        }
        [HttpPut("{id}")] // activities/id
        public async Task<ActionResult> EditActivity(Guid id, Activity activity)
        {
            activity.Id=id;

            return Ok(await Mediator.Send(new Edit.Command{Activity=activity}));
        }
        [HttpDelete("{id}")] // activities/id
        public async Task<ActionResult> DeleteActivity(Guid id)
        {
            return Ok(await Mediator.Send(new Delete.Command{Id=id}));
        }

    }
}