using System;
using System.Threading.Tasks;
using Application.Activities;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetActivities([FromQuery] ActivityParams param)
        {
            return HandlePagedResult(await Mediator.Send(new List.Query { PageParams = param }));
        }

        [HttpGet("server-error")]
        public ActionResult GetServerError()
        {
            throw new Exception("This is a server error");
        }

        [Authorize]
        [HttpGet("{id}")] // activities/id
        public async Task<IActionResult> GetActivity(Guid id)
        {
            return HandleResult(await Mediator.Send(new Details.Query { ID = id }));
        }
        [HttpPost] // activities/id
        public async Task<ActionResult> CreateActivity(Activity activity)
        {
            return HandleResult(await Mediator.Send(new Create.Command { Activity = activity }));
        }

        [Authorize(Policy = "IsActivityHost")]
        [HttpPut("{id}")] // activities/id
        public async Task<ActionResult> EditActivity(Guid id, Activity activity)
        {
            activity.Id = id;

            return HandleResult(await Mediator.Send(new Edit.Command { Activity = activity }));
        }

        [Authorize(Policy = "IsActivityHost")]
        [HttpDelete("{id}")] // activities/id
        public async Task<ActionResult> DeleteActivity(Guid id)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
        }

        [HttpPost("{id}/attend")]
        public async Task<IActionResult> Attend(Guid id)
        {
            return HandleResult(await Mediator.Send(new UpdateAttendance.Command { Id = id }));
        }
    }
}