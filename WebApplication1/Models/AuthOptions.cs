namespace WebApplication1.Models
{
    public class AuthOptions
    {
        public string SecretKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int TokenLifetime { get; set; }
        public bool ValidateIssuer { get; set; } = true;
        public bool ValidateAudience { get; set; } = true;
        public bool ValidateIssuerSigningKey { get; set; } = true;
    }
}

