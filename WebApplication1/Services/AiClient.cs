using WebApplication1.DTOs;

namespace WebApplication1.Servises
{
    public class AiClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public AiClient(string baseUrl)
        {
            _baseUrl = baseUrl;
            _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        }

        public async Task<ApiResponse> GetHotelRecommendationAsync(string userQuery, string userLocation, List<Hotel> hotels)
        {
            var request = new HotelRequest
            {
                UserQuery = userQuery,
                UserLocation = userLocation,
                Hotels = hotels
            };

            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/Hotel/recommend", request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<ApiResponse>();
        }

        public async Task<ChatResponse> StartChatAsync(string userLocation, List<Hotel> hotels)
        {
            var request = new StartChatRequest
            {
                UserLocation = userLocation,
                Hotels = hotels
            };

            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/api/chat/start", request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<ChatResponse>();
        }

        public async Task<ChatResponse> SendChatMessageAsync(string sessionId, string message)
        {
            var request = new ChatMessageRequest
            {
                SessionId = sessionId,
                Message = message
            };

            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/api/chat/message", request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<ChatResponse>();
        }

        public async Task<ChatResponse> GetChatHistoryAsync(string sessionId)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/api/chat/history/{sessionId}");
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<ChatResponse>();
        }
    }
}
