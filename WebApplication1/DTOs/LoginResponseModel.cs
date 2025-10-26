namespace WebApplication1.DTOs
{
    public class LoginResponseModel
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpires { get; set; }
        public string Username { get; set; } = string.Empty;
    }
}

