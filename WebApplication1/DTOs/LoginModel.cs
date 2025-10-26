using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs
{
    public class LoginModel
    {
        [Required(ErrorMessage = "Логин обязателен")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Пароль обязателен")]
        public string Password { get; set; } = string.Empty;
    }
}

