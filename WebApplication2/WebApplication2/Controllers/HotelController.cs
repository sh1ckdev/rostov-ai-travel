using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;
using WebApplication2.DTOs;

namespace WebApplication2.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HotelController
    {
        private readonly HttpClient _httpClient;
        private const string OpenRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
        private const string ApiKey = "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";

        public HotelController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {ApiKey}");
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
            var requestBody = new
            {
                model = "deepseek/deepseek-v3.2-exp", // Или другая модель
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
            var response = await _httpClient.PostAsync(OpenRouterUrl,
                new StringContent(json, Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonConvert.DeserializeObject<OpenRouterResponse>(content);

            return jsonResponse.Choices[0].Message.Content;
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
