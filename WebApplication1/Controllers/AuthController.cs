using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DTOs;
using WebApplication1.Exceptions;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger) =>
            (_authService, _logger) = (authService, logger);

        /// <summary>
        /// Регистрация нового пользователя
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Register([FromBody] RegisterModel registerModel)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                if (registerModel.Password != registerModel.ConfirmPassword) return BadRequest(new { message = "Пароли не совпадают" });

                var user = await _authService.RegisterAsync(registerModel);

                return CreatedAtAction(
                    nameof(Register), 
                    new { id = user.Id }, 
                    new 
                    { 
                        message = "Пользователь успешно зарегистрирован",
                        userId = user.Id,
                        login = user.Login
                    });
            }
            catch (UserAlreadyExistsException ex)
            {
                _logger.LogWarning("Попытка регистрации существующего пользователя: {Login}", registerModel.Login);
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogError("Ошибка валидации при регистрации: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при регистрации пользователя: {Login}", registerModel.Login);
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        /// <summary>
        /// Аутентификация пользователя
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponseModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginModel loginData)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var response = await _authService.LoginAsync(loginData.Username, loginData.Password);
                return Ok(response);
            }
            catch (InvalidCredentialsException)
            {
                _logger.LogWarning("Неудачная попытка входа для пользователя: {Login}", loginData.Username);
                return Unauthorized(new { message = "Неверные учетные данные" });
            }
            catch (ArgumentException ex)
            {
                _logger.LogError("Ошибка валидации при входе: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при авторизации пользователя: {Login}", loginData.Username);
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        /// <summary>
        /// Обновление access token используя refresh token
        /// </summary>
        [HttpPost("refresh")]
        [ProducesResponseType(typeof(LoginResponseModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RefreshToken([FromBody] TokenModel tokenModel)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var response = await _authService.RefreshTokenAsync(tokenModel.AccessToken, tokenModel.RefreshToken);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Ошибка обновления токена: {Message}", ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogError("Ошибка валидации токена: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении токена");
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        /// <summary>
        /// Выход из системы (инвалидация refresh token)
        /// </summary>
        [Authorize]
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var username = User.Identity?.Name;
                if (string.IsNullOrEmpty(username))
                    return Unauthorized(new { message = "Пользователь не авторизован" });

                await _authService.InvalidateRefreshTokenAsync(username);
                return Ok(new { message = "Вы успешно вышли из системы" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при выходе из системы");
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        /// <summary>
        /// Получение информации о текущем пользователе
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetCurrentUser()
        {
            var username = User.Identity?.Name;
            var userId = User.FindFirst("UserId")?.Value;

            return Ok(new
            {
                username,
                userId,
                isAuthenticated = User.Identity?.IsAuthenticated ?? false
            });
        }
    }
}

