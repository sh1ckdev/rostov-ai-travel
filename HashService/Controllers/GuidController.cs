using HashService.Services;
using Microsoft.AspNetCore.Mvc;

namespace HashService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GuidController : Controller
    {
        private readonly IGuidService _guidService;

        public GuidController(IGuidService guidService)
        {
            _guidService = guidService;
        }

        [HttpGet("guid")]
        public IActionResult GetGuid() => Ok(_guidService.GetGuid());
    }
}

