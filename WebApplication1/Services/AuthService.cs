using System.Security.Claims;
using WebApplication1.Constants;
using WebApplication1.DTOs;
using WebApplication1.Exceptions;
using WebApplication1.Models;

namespace WebApplication1.Services
{
    public interface IAuthService
    {
        Task<(bool success, User? user)> ValidateUserCredentialsAsync(string login, string password);
        Task<LoginResponseModel> LoginAsync(string login, string password);
        Task<LoginResponseModel> RefreshTokenAsync(string accessToken, string refreshToken);
        Task<User> RegisterAsync(RegisterModel registerModel);
        Task InvalidateRefreshTokenAsync(string login);
    }

    public class AuthService : IAuthService
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IUserService userService, ITokenService tokenService, ILogger<AuthService> logger) =>
            (_userService, _tokenService, _logger) = (userService, tokenService, logger);

        public async Task<(bool success, User? user)> ValidateUserCredentialsAsync(string login, string password)
        {
            try
            {
                var user = await _userService.GetUserByLoginAsync(login);
                if (user?.Salt == null || user.Password == null)
                    return (false, null);

                var isValid = await _userService.VerifyPasswordAsync(password, user.Password, user.Salt);
                return (isValid, isValid ? user : null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка валидации: {Login}", login);
                return (false, null);
            }
        }

        public async Task<LoginResponseModel> LoginAsync(string login, string password)
        {
            if (string.IsNullOrEmpty(login) || string.IsNullOrEmpty(password))
                throw new ArgumentException("Не задан логин или пароль");

            var (success, user) = await ValidateUserCredentialsAsync(login, password);
            if (!success || user == null)
                throw new InvalidCredentialsException();

            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, user.Login),
                new("UserId", user.Id.ToString())
            };

            var accessToken = _tokenService.GetAccessToken(claims, out DateTime expires);
            var refreshToken = _tokenService.GetRefreshToken();

            await _userService.UpdateUserAuthDataAsync(
                user.Login, 
                refreshToken, 
                expires.AddDays(ApplicationConstants.Auth.RefreshTokenLifetimeDays));

            return new LoginResponseModel
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                RefreshTokenExpires = expires.AddDays(ApplicationConstants.Auth.RefreshTokenLifetimeDays),
                Username = user.Login
            };
        }

        public async Task<LoginResponseModel> RefreshTokenAsync(string accessToken, string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken) || string.IsNullOrEmpty(accessToken))
                throw new ArgumentException("Недопустимый токен");

            var user = await _userService.GetUserByRefreshTokenAsync(refreshToken) 
                ?? throw new InvalidOperationException("Пользователь с таким refresh_token не найден или токен истёк");

            var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);

            var newAccessToken = _tokenService.GetAccessToken(principal.Claims, out DateTime expires);
            var newRefreshToken = _tokenService.GetRefreshToken();

            await _userService.UpdateUserAuthDataAsync(
                user.Login, 
                newRefreshToken, 
                expires.AddDays(ApplicationConstants.Auth.RefreshTokenLifetimeDays));

            return new LoginResponseModel
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                RefreshTokenExpires = expires.AddDays(ApplicationConstants.Auth.RefreshTokenLifetimeDays),
                Username = user.Login
            };
        }

        public async Task<User> RegisterAsync(RegisterModel registerModel)
        {
            ArgumentNullException.ThrowIfNull(registerModel);

            if (string.IsNullOrWhiteSpace(registerModel.Login) || string.IsNullOrWhiteSpace(registerModel.Password))
                throw new ArgumentException("Логин и пароль обязательны");

            _logger.LogInformation("Регистрация: {Login}", registerModel.Login);
            return await _userService.CreateUserAsync(registerModel);
        }

        public Task InvalidateRefreshTokenAsync(string login) =>
            _userService.UpdateUserAuthDataAsync(login, string.Empty, DateTime.UtcNow.AddDays(-1));
    }
}

