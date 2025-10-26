using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using WebApplication1.DTOs;
using WebApplication1.Models;
using Hotel = WebApplication1.Models.Hotel;

namespace WebApplication1.Services
{
    public interface IHotelService
    {
        Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetHotelsAsync(SieveModel sieveModel);
        Task<HotelDto?> GetHotelByIdAsync(int id);
        Task<HotelDto> CreateHotelAsync(CreateHotelDto dto);
        Task<HotelDto?> UpdateHotelAsync(int id, UpdateHotelDto dto);
        Task<bool> DeleteHotelAsync(int id);
        Task<bool> CheckAvailabilityAsync(int hotelId, DateTime checkIn, DateTime checkOut);
        Task<IEnumerable<HotelDto>> SearchHotelsAsync(string searchTerm);
        Task<IEnumerable<HotelReviewDto>> GetHotelReviewsAsync(int hotelId);
        Task<HotelReviewDto> AddReviewAsync(int hotelId, int userId, CreateReviewDto dto);
        Task<bool> ToggleFavoriteAsync(int hotelId, int userId);
        Task<bool> BookHotelAsync(int hotelId, int userId, HotelBookingDto dto);
    }

    public class HotelService : IHotelService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<HotelService> _logger;
        private readonly ISieveProcessor _sieveProcessor;
        
        private static readonly Func<Hotel, HotelDto> MapToDto = h => new()
        {
            Id = h.Id,
            Name = h.Name,
            Description = h.Description,
            DaytimeOpen = h.DaytimeOpen,
            DaytimeClose = h.DaytimeClose,
            Cost = h.Cost,
            Adress = h.Adress,
            Contacts = h.Contacts,
            IsAvalible = h.IsAvalible == 1
        };

        public HotelService(ApplicationDbContext context, ILogger<HotelService> logger, ISieveProcessor sieveProcessor) =>
            (_context, _logger, _sieveProcessor) = (context, logger, sieveProcessor);

        public async Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetHotelsAsync(SieveModel sieveModel)
        {
            var query = _context.Hotels.AsQueryable();
            var totalCount = await _sieveProcessor.Apply(sieveModel, query, applyPagination: false).CountAsync();
            var hotels = await _sieveProcessor.Apply(sieveModel, query).Select(h => MapToDto(h)).ToListAsync();
            return (hotels, totalCount);
        }

        public async Task<HotelDto?> GetHotelByIdAsync(int id) =>
            await _context.Hotels.Where(h => h.Id == id).Select(h => MapToDto(h)).FirstOrDefaultAsync();

        public async Task<HotelDto> CreateHotelAsync(CreateHotelDto dto)
        {
            var hotel = new Hotel
            {
                Name = dto.Name,
                Description = dto.Description,
                DaytimeOpen = dto.DaytimeOpen,
                DaytimeClose = dto.DaytimeClose,
                Cost = dto.Cost,
                Adress = dto.Adress,
                Contacts = dto.Contacts,
                IsAvalible = 1
            };

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Создан отель: {Name} (ID: {Id})", hotel.Name, hotel.Id);

            return await GetHotelByIdAsync(hotel.Id) ?? throw new InvalidOperationException();
        }

        public async Task<HotelDto?> UpdateHotelAsync(int id, UpdateHotelDto dto)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null) return null;

            hotel.Name = dto.Name;
            hotel.Description = dto.Description;
            hotel.DaytimeOpen = dto.DaytimeOpen;
            hotel.DaytimeClose = dto.DaytimeClose;
            hotel.Cost = dto.Cost;
            hotel.Adress = dto.Adress;
            hotel.Contacts = dto.Contacts;

            if (dto.IsAvalible.HasValue)
                hotel.IsAvalible = dto.IsAvalible.Value ? (sbyte)1 : (sbyte)0;

            await _context.SaveChangesAsync();
            return await GetHotelByIdAsync(id);
        }

        public async Task<bool> DeleteHotelAsync(int id) =>
            await _context.Hotels.Where(h => h.Id == id).ExecuteDeleteAsync() > 0;

        public Task<bool> CheckAvailabilityAsync(int hotelId, DateTime checkIn, DateTime checkOut) =>
            _context.Hotels.AnyAsync(h => h.Id == hotelId && h.IsAvalible == 1);

        public async Task<IEnumerable<HotelDto>> SearchHotelsAsync(string searchTerm) =>
            await _context.Hotels
                .Where(h => h.Name.Contains(searchTerm) || (h.Description != null && h.Description.Contains(searchTerm)))
                .Select(h => MapToDto(h))
                .ToListAsync();

        public async Task<IEnumerable<HotelReviewDto>> GetHotelReviewsAsync(int hotelId)
        {
            var hotel = await _context.Hotels.Include(h => h.Reviews).FirstOrDefaultAsync(h => h.Id == hotelId);
            if (hotel is null) return Enumerable.Empty<HotelReviewDto>();

            return hotel.Reviews.Select(r => new HotelReviewDto
            {
                Id = (int)(r.Id.Ticks % int.MaxValue),
                HotelId = hotelId,
                Description = r.Description?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                Date = r.Date ?? DateTime.UtcNow
            }).ToList();
        }

        public async Task<HotelReviewDto> AddReviewAsync(int hotelId, int userId, CreateReviewDto dto)
        {
            var hotel = await _context.Hotels.Include(h => h.Reviews).FirstOrDefaultAsync(h => h.Id == hotelId) 
                ?? throw new ArgumentException($"Отель с ID {hotelId} не найден");

            // БД имеет странную структуру: все поля DateTime (id = CURRENT_TIMESTAMP, description = TIMESTAMP, date = DATETIME)
            var now = DateTime.UtcNow;
            var review = new Review { Id = now, Date = now, Description = now };

            hotel.Reviews.Add(review);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Добавлен отзыв для отеля {HotelId} от пользователя {UserId}", hotelId, userId);

            return new HotelReviewDto
            {
                Id = (int)(review.Id.Ticks % int.MaxValue),
                HotelId = hotelId,
                Description = dto.Description,
                Date = review.Date ?? DateTime.UtcNow
            };
        }

        public async Task<bool> ToggleFavoriteAsync(int hotelId, int userId)
        {
            var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ItemId == hotelId && f.ItemType == "hotel");
            
            if (favorite is not null)
            {
                _context.Favorites.Remove(favorite);
                await _context.SaveChangesAsync();
                return false;
            }

            _context.Favorites.Add(new Favorite { UserId = userId, ItemType = "hotel", ItemId = hotelId, AddedDate = DateTime.UtcNow });
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> BookHotelAsync(int hotelId, int userId, HotelBookingDto dto)
        {
            var hotel = await _context.Hotels.Include(h => h.Users).FirstOrDefaultAsync(h => h.Id == hotelId) 
                ?? throw new ArgumentException($"Отель с ID {hotelId} не найден");
            
            if (hotel.IsAvalible != 1) throw new InvalidOperationException("Отель недоступен для бронирования");

            var user = await _context.Users.FindAsync(userId) ?? throw new ArgumentException($"Пользователь с ID {userId} не найден");

            if (hotel.Users.Any(u => u.Id == userId))
            {
                _logger.LogWarning("Пользователь {UserId} уже имеет бронирование отеля {HotelId}", userId, hotelId);
                return false;
            }

            hotel.Users.Add(user);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Создано бронирование отеля {HotelId} пользователем {UserId}", hotelId, userId);
            return true;
        }
    }
}

