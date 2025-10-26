using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Получить прогноз погоды (публичный endpoint)
        /// </summary>
        [HttpGet("public", Name = "GetPublicWeatherForecast")]
        public IEnumerable<WeatherForecast> GetPublic()
        {
            _logger.LogInformation("Запрос публичного прогноза погоды");
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }

        /// <summary>
        /// Получить детальный прогноз погоды (требует авторизацию)
        /// </summary>
        [Authorize]
        [HttpGet("detailed", Name = "GetDetailedWeatherForecast")]
        public ActionResult<object> GetDetailed()
        {
            var username = User.Identity?.Name;
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            _logger.LogInformation("Пользователь {Username} запросил детальный прогноз", username);

            var forecast = Enumerable.Range(1, 7).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();

            return Ok(new
            {
                requestedBy = username,
                userRole = role,
                forecastDays = 7,
                forecast
            });
        }

        /// <summary>
        /// Получить прогноз погоды (только для администраторов)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin", Name = "GetAdminWeatherForecast")]
        public ActionResult<object> GetAdmin()
        {
            var username = User.Identity?.Name;
            _logger.LogInformation("Администратор {Username} запросил полный прогноз", username);

            var forecast = Enumerable.Range(1, 30).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();

            return Ok(new
            {
                requestedBy = username,
                message = "Полный месячный прогноз (только для администраторов)",
                forecastDays = 30,
                forecast
            });
        }
    }
}
