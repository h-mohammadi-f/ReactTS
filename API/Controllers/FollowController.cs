using System.Threading.Tasks;
using Application.Followers;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class FollowController : BaseApiController
    {
        [HttpPost("{targetusername}")]
        public async Task<IActionResult> Follow(string targetusername)
        {
            return HandleResult(await Mediator.Send(new FollowToggle.Command { TargetUsername = targetusername }));
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetFollowings(string username, string predicate)
        {
            return HandleResult(await Mediator.Send(new List.Query { Username = username, Predicate = predicate }));
        }

    }
}