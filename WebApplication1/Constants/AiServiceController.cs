using Microsoft.AspNetCore.Mvc;
using System.Text;
using WebApplication1.DTOs;
using WebApplication1.Services;
using WebApplication1.Servises;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelServiceController : ControllerBase
    {
        private readonly AiClient _aiClient;
        private readonly IHotelService _hotelService;
        private static readonly Dictionary<string, string> _userSessions = new();

        public HotelServiceController(AiClient aiClient, IHotelService hotelService) =>
            (_aiClient, _hotelService) = (aiClient, hotelService);
        [HttpGet("recommendation")]
        public async Task<ActionResult<ApiResponse>> GetRecommendation([FromQuery] string location)
        {
            try
            {
                var hotels = await GetHotelsFromDatabaseAsync(location);
                if (!hotels.Any()) return NotFound(new { message = $"Отели в локации '{location}' не найдены" });

                var response = await _aiClient.GetHotelRecommendationAsync("Порекомендуйте лучший отель в этой локации", location, hotels);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при получении рекомендации: {ex.Message}");
            }
        }
        [HttpPost("chat/start")]
        public async Task<ActionResult<ChatResponse>> StartChat([FromBody] StartChatUserRequest request)
        {
            try
            {
                var hotels = await GetHotelsFromDatabaseAsync(request.Location);
                if (!hotels.Any()) return NotFound(new { message = $"Отели в локации '{request.Location}' не найдены" });

                var response = await _aiClient.StartChatAsync(request.Location, hotels);
                _userSessions[GetCurrentUserId()] = response.SessionId;
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при запуске чата: {ex.Message}");
            }
        }
        [HttpPost("chat/send")]
        public async Task<ActionResult<ChatResponse>> SendMessage([FromBody] ChatMessageRequest request)
        {
            try
            {
                var response = await _aiClient.SendChatMessageAsync(request.SessionId, request.Message);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при отправке сообщения: {ex.Message}");
            }
        }

        [HttpGet("chat/history/{sessionId}")]
        public async Task<ActionResult<ChatResponse>> GetChatHistory(string sessionId)
        {
            try
            {
                var response = await _aiClient.GetChatHistoryAsync(sessionId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при получении истории: {ex.Message}");
            }
        }

        private async Task<List<Hotel>> GetHotelsFromDatabaseAsync(string location)
        {
            var hotelsFromDb = await _hotelService.SearchHotelsAsync(location);
            if (!hotelsFromDb.Any()) hotelsFromDb = (await _hotelService.SearchHotelsAsync("")).Take(10);

            var hotelTasks = hotelsFromDb.Select(async h => new Hotel
            {
                Name = h.Name ?? "Без названия",
                Address = h.Adress ?? (string.IsNullOrEmpty(location) ? "Адрес не указан" : location),
                ReviewCount = (await _hotelService.GetHotelReviewsAsync(h.Id)).Count()
            });

            return (await Task.WhenAll(hotelTasks)).ToList();
        }

        private string GetCurrentUserId() =>
            Convert.ToBase64String(Encoding.UTF8.GetBytes($"{HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"}:{HttpContext.Request.Headers["User-Agent"]}"));
    }
}
