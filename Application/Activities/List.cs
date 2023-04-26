using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<Result<PagedList<ActivityDto>>>
        {
            public ActivityParams PageParams { get; set; }
        }
        public class Handler : IRequestHandler<Query, Result<PagedList<ActivityDto>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _mapper = mapper;
                _context = context;

            }
            public async Task<Result<PagedList<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                //Eager loading does not have efficient queries from db
                // var activities = await _context.Activities
                // .Include(a => a.Attendees)
                // .ThenInclude(u => u.AppUser)
                // .ToListAsync(cancellationToken);

                var query = _context.Activities
                .Where(d => d.Date >= request.PageParams.StartDate)
                .OrderBy(c => c.Date)
                .ProjectTo<ActivityDto>(_mapper.ConfigurationProvider,
                 new { currentUsername = _userAccessor.GetUsername() })
                .AsQueryable();
                //projectto  doing this for us
                // var activitiesToReturn = _mapper.Map<List<ActivityDto>>(activities);

                if (request.PageParams.IsGoing && !request.PageParams.IsHost)
                {
                    query = query.Where(x => x.Attendees.Any(a => a.Username == _userAccessor.GetUsername()));
                }

                if (!request.PageParams.IsGoing && request.PageParams.IsHost)
                {
                    query = query.Where(x => x.HostUsername == _userAccessor.GetUsername());
                }

                return Result<PagedList<ActivityDto>>.Success(
                    await PagedList<ActivityDto>.CreateAsync(query,
                    request.PageParams.PageNumber, request.PageParams.PageSize)
                );
            }
        }
    }
}