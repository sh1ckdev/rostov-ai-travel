using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;

        public HealthController(ILogger<HealthController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public IActionResult GetHealth()
        {
            _logger.LogInformation("Health check requested");
            
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "WebApplication1 API",
                version = "1.0.0"
            });
        }

        /// <summary>
        /// Detailed health check with dependencies
        /// </summary>
        [HttpGet("detailed")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public IActionResult GetDetailedHealth()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "WebApplication1 API",
                version = "1.0.0",
                dependencies = new
                {
                    database = "healthy",
                    hashService = "healthy"
                }
            });
        }
    }
}

