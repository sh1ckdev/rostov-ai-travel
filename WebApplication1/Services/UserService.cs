using Microsoft.EntityFrameworkCore;
using WebApplication1.DTOs;
using WebApplication1.Exceptions;
using WebApplication1.Models;

namespace WebApplication1.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByLoginAsync(string login);
        Task<User?> GetUserByRefreshTokenAsync(string refreshToken);
        Task<User> CreateUserAsync(RegisterModel registerModel);
        Task UpdateUserAuthDataAsync(string login, string refreshToken, DateTime refreshTokenExpires);
        Task<bool> VerifyPasswordAsync(string password, string hashedPassword, byte[] salt);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHashService _hashService;
        private readonly ILogger<UserService> _logger;

        public UserService(ApplicationDbContext context, IHashService hashService, ILogger<UserService> logger) =>
            (_context, _hashService, _logger) = (context, hashService, logger);

        public Task<User?> GetUserByLoginAsync(string login) =>
            _context.Users.FirstOrDefaultAsync(u => u.FirstName == login);

        public Task<User?> GetUserByRefreshTokenAsync(string refreshToken) =>
            _context.Users.FirstOrDefaultAsync(u =>
                u.RefreshToken == refreshToken &&
                u.ExpirationDate.HasValue &&
                u.ExpirationDate.Value > DateTime.UtcNow);

        public async Task<User> CreateUserAsync(RegisterModel registerModel)
        {
            if (await _context.Users.AnyAsync(u => u.FirstName == registerModel.Login))
                throw new UserAlreadyExistsException(registerModel.Login);

            var salt = await _hashService.GenerateSaltAsync();
            var hashedPassword = await _hashService.GetSha256HashAsync(registerModel.Password, salt);

            var user = new User
            {
                FirstName = registerModel.Login,
                SecondName = registerModel.FullName,
                LastName = registerModel.Email,
                Password = hashedPassword,
                Salt = salt
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Создан пользователь: {Login} (ID: {Id})", user.FirstName, user.Id);
            return user;
        }

        public async Task UpdateUserAuthDataAsync(string login, string refreshToken, DateTime refreshTokenExpires)
        {
            await _context.Users
                .Where(u => u.FirstName == login)
                .ExecuteUpdateAsync(u => u
                    .SetProperty(x => x.RefreshToken, refreshToken)
                    .SetProperty(x => x.ExpirationDate, refreshTokenExpires));
        }

        public async Task<bool> VerifyPasswordAsync(string password, string hashedPassword, byte[] salt)
        {
            var hash = await _hashService.GetSha256HashAsync(password, salt);
            return hash == hashedPassword;
        }
    }
}

