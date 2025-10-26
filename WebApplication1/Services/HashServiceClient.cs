using System.Text;
using System.Text.Json;

namespace WebApplication1.Services
{
    public interface IHashService
    {
        Task<string> GetSha256HashAsync(string text, byte[] salt);
        Task<byte[]> GenerateSaltAsync();
    }

    public class HashServiceClient : IHashService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<HashServiceClient> _logger;

        public HashServiceClient(HttpClient httpClient, ILogger<HashServiceClient> logger) =>
            (_httpClient, _logger) = (httpClient, logger);

        public async Task<byte[]> GenerateSaltAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/Hash/salt");
                response.EnsureSuccessStatusCode();
                
                var base64Salt = await response.Content.ReadAsStringAsync();
                return Convert.FromBase64String(base64Salt.Trim('"'));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при генерации соли через HashService");
                throw;
            }
        }

        public async Task<string> GetSha256HashAsync(string text, byte[] salt)
        {
            try
            {
                var request = new { Text = text, Salt = salt };
                var content = new StringContent(
                    JsonSerializer.Serialize(request),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync("/Hash/sha256", content);
                response.EnsureSuccessStatusCode();

                var hash = await response.Content.ReadAsStringAsync();
                return hash.Trim('"');
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при хешировании через HashService");
                throw;
            }
        }
    }
}

