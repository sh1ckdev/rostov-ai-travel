using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using static WebApplication2.Controllers.HotelController;
using System.Text;
using WebApplication2.DTOs;

namespace WebApplication2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private static readonly Dictionary<string, ChatSession> _sessions = new();
        private readonly HttpClient _httpClient;
        private const string OpenRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
        private const string ApiKey = "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";

        public ChatController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {ApiKey}");
        }

        // Начало нового диалога
        [HttpPost("start")]
        public ActionResult<ChatResponse> StartChat([FromBody] StartChatRequest request)
        {
            var sessionId = Guid.NewGuid().ToString();

            var session = new ChatSession
            {
                SessionId = sessionId,
                UserLocation = request.UserLocation,
                Hotels = request.Hotels
            };

            // Добавляем приветственное сообщение
            session.MessageHistory.Add(new ChatMessage
            {
                Role = "assistant",
                Content = "Привет! Я ваш помощник по выбору отелей. Чем могу помочь?",
                Timestamp = DateTime.Now
            });

            _sessions[sessionId] = session;

            return new ChatResponse
            {
                SessionId = sessionId,
                Response = "Привет! Я ваш помощник по выбору отелей. Чем могу помочь?",
                FullHistory = session.MessageHistory.Select(m => new MessageDto
                {
                    Role = m.Role,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                }).ToList()
            };
        }

        // Отправка сообщения
        [HttpPost("message")]
        public async Task<ActionResult<ChatResponse>> SendMessage([FromBody] ChatMessageRequest request)
        {
            if (!_sessions.ContainsKey(request.SessionId))
                return BadRequest("Сессия не найдена");

            var session = _sessions[request.SessionId];

            // Добавляем сообщение пользователя в историю
            session.MessageHistory.Add(new ChatMessage
            {
                Role = "user",
                Content = request.Message,
                Timestamp = DateTime.Now
            });

            // Формируем промпт с контекстом
            var prompt = BuildPrompt(session, request.Message);

            // Отправляем в нейросеть
            var aiResponse = await GetAIResponse(prompt);

            // Добавляем ответ ассистента в историю
            session.MessageHistory.Add(new ChatMessage
            {
                Role = "assistant",
                Content = aiResponse,
                Timestamp = DateTime.Now
            });

            // Возвращаем ответ И всю историю
            return new ChatResponse
            {
                SessionId = request.SessionId,
                Response = aiResponse,
                FullHistory = session.MessageHistory.Select(m => new MessageDto
                {
                    Role = m.Role,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                }).ToList()
            };
        }

        // Получить историю диалога
        [HttpGet("history/{sessionId}")]
        public ActionResult<ChatResponse> GetHistory(string sessionId)
        {
            if (!_sessions.ContainsKey(sessionId))
                return BadRequest("Сессия не найдена");

            var session = _sessions[sessionId];

            return new ChatResponse
            {
                SessionId = sessionId,
                Response = "История диалога",
                FullHistory = session.MessageHistory.Select(m => new MessageDto
                {
                    Role = m.Role,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                }).ToList()
            };
        }

        private string BuildPrompt(ChatSession session, string userMessage)
        {
            var hotelsText = string.Join("\n", session.Hotels.Select(h =>
                $"- {h.Name} | Адрес: {h.Address} | Отзывов: {h.ReviewCount}"));

            // Берем только последние 10 сообщений для контекста (чтобы не превысить лимиты)
            var recentHistory = session.MessageHistory
                .TakeLast(10)
                .Select(m => $"{m.Role}: {m.Content}");

            var historyText = string.Join("\n", recentHistory);

            return @$"Ты - консультант по отелям. 

                        Контекст:
                        - Локация пользователя: {session.UserLocation}
                        - Доступные отели:
                        {hotelsText}

                        История диалога (последние сообщения):
                        {historyText}

                        Текущий запрос пользователя: {userMessage}

                        Ответь на вопрос пользователя, используя информацию об отелях. Будь полезным и дружелюбным.";
        }

        private async Task<string> GetAIResponse(string prompt)
        {
            var requestBody = new
            {
                model = "deepseek/deepseek-v3.2-exp",
                messages = new[]
                {
                new { role = "user", content = prompt }
            }
            };

            var json = JsonConvert.SerializeObject(requestBody);
            var response = await _httpClient.PostAsync(
                OpenRouterUrl,
                new StringContent(json, Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonConvert.DeserializeObject<OpenRouterResponse>(content);

            return jsonResponse.Choices[0].Message.Content;
        }
    }
}
