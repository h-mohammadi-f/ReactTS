using System.Text.Json;
using Microsoft.AspNetCore.Http;


namespace API.Extensions
{
    public static class HttpExtensions
    {
        public static void AddPagingationHeader(this HttpResponse response, int CurrentPage, int itemsPerpage,
                                                int totalItems, int totalPages)
        {
            var paginationHeader = new
            {
                CurrentPage,
                itemsPerpage,
                totalItems,
                totalPages
            };

            response.Headers.Add("Pagination", JsonSerializer.Serialize(paginationHeader));
            response.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }
    }
}