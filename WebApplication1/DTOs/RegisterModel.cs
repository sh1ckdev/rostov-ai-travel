using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "Логин обязателен")]
        [MinLength(3, ErrorMessage = "Логин должен содержать минимум 3 символа")]
        public string Login { get; set; } = string.Empty;

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(6, ErrorMessage = "Пароль должен содержать минимум 6 символов")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Подтверждение пароля обязательно")]
        [Compare("Password", ErrorMessage = "Пароли не совпадают")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Некорректный email адрес")]
        public string? Email { get; set; }

        public string? FullName { get; set; }
    }
}

