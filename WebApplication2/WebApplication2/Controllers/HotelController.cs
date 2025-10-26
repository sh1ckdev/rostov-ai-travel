using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;
using WebApplication2.DTOs;

namespace WebApplication2.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HotelController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<HotelController> _logger;
        private const string OpenRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
        private const string ApiKey = "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";
        private const bool UseMockMode = true; // true = моковые ответы, false = реальный OpenRouter API

        // Словарь для хранения сессий чата (в реальном проекте использовать Redis/БД)
        private static Dictionary<string, List<HotelChatMessage>> _chatSessions = new();

        public HotelController(IHttpClientFactory httpClientFactory, ILogger<HotelController> logger)
        {
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {ApiKey}");
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:8082");
            _httpClient.DefaultRequestHeaders.Add("X-Title", "Rostov AI Travel");
            _logger = logger;
            _logger.LogInformation("HotelController инициализирован с OpenRouter API");
        }

        /// <summary>
        /// Начать новую сессию чата с AI помощником
        /// </summary>
        [HttpPost("chat/start")]
        [ProducesResponseType(typeof(WebApplication2.DTOs.ChatResponse), StatusCodes.Status200OK)]
        public IActionResult StartChat([FromBody] HotelChatStartRequest request)
        {
            try
            {
                _logger.LogInformation("Начало новой сессии чата с локацией: {Location}", request?.Location ?? "не указано");
                
                var sessionId = Guid.NewGuid().ToString();
                var systemMessage = new HotelChatMessage
                {
                    Role = "system",
                    Content = $"Ты - AI помощник по поиску отелей. Пользователь находится в: {request?.Location ?? "не указано"}. " +
                             "Помогай пользователю выбрать лучший отель, учитывая его локацию и предпочтения."
                };

                _chatSessions[sessionId] = new List<HotelChatMessage> { systemMessage };
                
                return Ok(new WebApplication2.DTOs.ChatResponse
                {
                    SessionId = sessionId,
                    Response = $"Привет! Я помогу вам найти отель в {request?.Location ?? "вашем городе"}. Что для вас важно при выборе отеля?",
                    FullHistory = new List<MessageDto>()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании сессии чата");
                return StatusCode(500, new { message = "Ошибка создания сессии чата", error = ex.Message });
            }
        }

        /// <summary>
        /// Отправить сообщение в чат
        /// </summary>
        [HttpPost("chat/send")]
        [ProducesResponseType(typeof(WebApplication2.DTOs.ChatResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> SendMessage([FromBody] HotelChatSendRequest request)
        {
            try
            {
                if (!_chatSessions.ContainsKey(request.SessionId))
                {
                    return BadRequest(new { message = "Сессия не найдена" });
                }

                var messages = _chatSessions[request.SessionId];
                messages.Add(new HotelChatMessage { Role = "user", Content = request.Message });

                var aiResponse = await GetOpenRouterChatResponse(messages);
                messages.Add(new HotelChatMessage { Role = "assistant", Content = aiResponse });

                return Ok(new WebApplication2.DTOs.ChatResponse
                {
                    SessionId = request.SessionId,
                    Response = aiResponse,
                    FullHistory = messages.Where(m => m.Role != "system")
                        .Select(m => new MessageDto { Role = m.Role, Content = m.Content, Timestamp = DateTime.UtcNow })
                        .ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при отправке сообщения");
                return StatusCode(500, new { message = "Ошибка отправки сообщения", error = ex.Message });
            }
        }

        /// <summary>
        /// Получить историю чата
        /// </summary>
        [HttpGet("chat/history/{sessionId}")]
        [ProducesResponseType(typeof(HotelChatHistory), StatusCodes.Status200OK)]
        public IActionResult GetChatHistory(string sessionId)
        {
            if (!_chatSessions.ContainsKey(sessionId))
            {
                return NotFound(new { message = "Сессия не найдена" });
            }

            return Ok(new HotelChatHistory
            {
                SessionId = sessionId,
                Messages = _chatSessions[sessionId].Where(m => m.Role != "system").ToList()
            });
        }

        [HttpPost("recommend")]
        public async Task<ActionResult<ApiResponse>> RecommendHotel(HotelRequest request)
        {
            var prompt = BuildPrompt(request);
            var response = await GetOpenRouterResponse(prompt);
            return new ApiResponse { Response = response };
        }
        private string BuildPrompt(HotelRequest request)
        {
            var hotelsText = string.Join("\n", request.Hotels.Select(h =>
                $"- {h.Name} | Адрес: {h.Address} | Отзывов: {h.ReviewCount}"));

            return @$"Пользователь ищет отель. Его запрос: ""{request.UserQuery}""
                    Локация пользователя: {request.UserLocation}

                    Доступные отели:
                    {hotelsText}

                    Проанализируй отели по количеству отзывов и расстоянию до локации пользователя. 
                    Выбери лучший вариант и кратко обоснуй выбор. Формат ответа:
                    1. Рекомендуемый отель: [название]
                    2. Причина: [обоснование]";
        }
        private async Task<string> GetOpenRouterResponse(string prompt)
        {
            if (UseMockMode)
            {
                _logger.LogInformation("🤖 Используется MOCK режим AI (OpenRouter отключен)");
                await Task.Delay(300); // Имитация задержки сети
                
                // Умный парсинг промпта для релевантного ответа
                if (prompt.Contains("Radisson"))
                {
                    return @"1. Рекомендуемый отель: Radisson Gorizont Rostov-on-Don
2. Причина: Престижный отель международной сети с высоким уровнем сервиса. Удобное расположение на проспекте Нагибина обеспечивает отличную транспортную доступность. Идеально подходит для деловых и туристических поездок.";
                }
                
                if (prompt.Contains("Таганрог") || prompt.Contains("отель"))
                {
                    return @"1. Рекомендуемый отель: Отель из топа списка
2. Причина: Хорошее сочетание цены и качества. Удобное расположение в городе позволяет легко добраться до основных достопримечательностей. Положительные отзывы гостей подтверждают качество обслуживания.";
                }
                
                return @"1. Рекомендуемый отель: Лучший вариант из доступных
2. Причина: Оптимальное соотношение расположения, сервиса и стоимости. Рекомендую для комфортного проживания.";
            }

            // РЕАЛЬНЫЙ РЕЖИМ - вызов OpenRouter API
            try
            {
                var requestBody = new
                {
                    model = "deepseek/deepseek-v3.2-exp",
                    messages = new[]
                    {
                        new
                        {
                            role = "user",
                            content = prompt
                        }
                    }
                };

                var json = JsonConvert.SerializeObject(requestBody);
                _logger.LogInformation("Отправка запроса в OpenRouter API");
                
                var response = await _httpClient.PostAsync(OpenRouterUrl,
                    new StringContent(json, Encoding.UTF8, "application/json"));

                var content = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("OpenRouter API вернул ошибку {StatusCode}: {Content}", 
                        response.StatusCode, content);
                    return $"Ошибка API: {response.StatusCode}. Проверьте API ключ OpenRouter.";
                }
                
                _logger.LogInformation("OpenRouter API вернул успешный ответ");
                var jsonResponse = JsonConvert.DeserializeObject<OpenRouterResponse>(content);

                return jsonResponse?.Choices?[0]?.Message?.Content ?? "Ошибка получения ответа";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Исключение при запросе к OpenRouter API");
                return $"Ошибка при обращении к AI: {ex.Message}";
            }
        }

        private async Task<string> GetOpenRouterChatResponse(List<HotelChatMessage> messages)
        {
            // MOCK РЕЖИМ - возвращаем умный ответ без вызова API
            if (UseMockMode)
            {
                _logger.LogInformation("🤖 Используется MOCK режим AI чата (OpenRouter отключен)");
                await Task.Delay(500); // Имитация задержки сети
                
                // Получаем последнее сообщение пользователя
                var lastUserMessage = messages.LastOrDefault(m => m.Role == "user")?.Content?.ToLower() ?? "";
                
                if (lastUserMessage.Contains("привет") || lastUserMessage.Contains("hello"))
                {
                    return "Привет! Я AI помощник по подбору отелей. Расскажите, что вы ищете - я помогу найти идеальный вариант для вашего размещения!";
                }
                
                if (lastUserMessage.Contains("бассейн") || lastUserMessage.Contains("pool"))
                {
                    return "Для отелей с бассейном рекомендую обратить внимание на Radisson Gorizont - там есть крытый бассейн и СПА-зона. Также хорошие варианты с бассейнами есть в загородных отелях.";
                }
                
                if (lastUserMessage.Contains("цена") || lastUserMessage.Contains("дешев") || lastUserMessage.Contains("бюджет"))
                {
                    return "По доступным ценам могу порекомендовать отели средней категории. Обычно стоимость колеблется от 2500 до 5000 рублей за ночь. Хотите, чтобы я подобрал конкретные варианты в вашем бюджете?";
                }
                
                if (lastUserMessage.Contains("центр") || lastUserMessage.Contains("центральн"))
                {
                    return "В центре города отличное расположение у нескольких отелей. Особенно удобны те, что на Большой Садовой улице - оттуда пешком до всех основных достопримечательностей.";
                }
                
                return "Понял ваш запрос! Могу порекомендовать несколько отличных вариантов. Уточните, пожалуйста, что для вас важнее всего: расположение, цена или определенные удобства?";
            }

            // РЕАЛЬНЫЙ РЕЖИМ - вызов OpenRouter API
            try
            {
                var requestBody = new
                {
                    model = "deepseek/deepseek-v3.2-exp",
                    messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToArray()
                };

                var json = JsonConvert.SerializeObject(requestBody);
                _logger.LogInformation("Отправка чат-запроса в OpenRouter API");
                
                var response = await _httpClient.PostAsync(OpenRouterUrl,
                    new StringContent(json, Encoding.UTF8, "application/json"));

                var content = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("OpenRouter API вернул ошибку {StatusCode}: {Content}", 
                        response.StatusCode, content);
                    return $"Ошибка API: {response.StatusCode}. Проверьте API ключ OpenRouter.";
                }
                
                _logger.LogInformation("OpenRouter API вернул успешный чат-ответ");
                var jsonResponse = JsonConvert.DeserializeObject<OpenRouterResponse>(content);

                return jsonResponse?.Choices?[0]?.Message?.Content ?? "Ошибка получения ответа";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Исключение при чат-запросе к OpenRouter API");
                return $"Ошибка при обращении к AI: {ex.Message}";
            }
        }

        // DTOs для HotelService (не конфликтуют с WebApplication2.DTOs)
        public class HotelChatStartRequest
        {
            public string? Location { get; set; }
        }

        public class HotelChatSendRequest
        {
            public string SessionId { get; set; }
            public string Message { get; set; }
        }

        public class HotelChatHistory
        {
            public string SessionId { get; set; }
            public List<HotelChatMessage> Messages { get; set; }
        }

        public class HotelChatMessage
        {
            public string Role { get; set; }
            public string Content { get; set; }
        }

        // Модель для ответа OpenRouter
        public class OpenRouterResponse
        {
            public Choice[] Choices { get; set; }
        }

        public class Choice
        {
            public Message Message { get; set; }
        }

        public class Message
        {
            public string Content { get; set; }
        }
    }
}
