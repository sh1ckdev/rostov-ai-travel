using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;
using WebApplication1.DTOs;
using WebApplication1.Models;
using Hotel = WebApplication1.Models.Hotel;

namespace WebApplication1.Services
{
    public interface IHotelService
    {
        Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetHotelsAsync(SieveModel sieveModel);
        Task<(IEnumerable<HotelWithReviewCountDto> Hotels, int TotalCount)> GetHotelsWithReviewCountsAsync(SieveModel sieveModel);
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
        private readonly IDbContextFactory<ApplicationDbContext> _contextFactory;
        private readonly ILogger<HotelService> _logger;
        private readonly ISieveProcessor _sieveProcessor;
        
        private static readonly Expression<Func<Hotel, HotelDto>> MapToDto = h => new HotelDto
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

        public HotelService(IDbContextFactory<ApplicationDbContext> contextFactory, ILogger<HotelService> logger, ISieveProcessor sieveProcessor) =>
            (_contextFactory, _logger, _sieveProcessor) = (contextFactory, logger, sieveProcessor);

        public async Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetHotelsAsync(SieveModel sieveModel)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            var query = context.Hotels.AsQueryable();
            var totalCount = await _sieveProcessor.Apply(sieveModel, query, applyPagination: false).CountAsync();
            var hotels = await _sieveProcessor.Apply(sieveModel, query).Select(MapToDto).ToListAsync();
            return (hotels, totalCount);
        }

        public async Task<(IEnumerable<HotelWithReviewCountDto> Hotels, int TotalCount)> GetHotelsWithReviewCountsAsync(SieveModel sieveModel)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            
            // Получаем отели с подсчетом отзывов через SQL
            var query = from h in context.Hotels
                        select new HotelWithReviewCountDto
                        {
                            Id = h.Id,
                            Name = h.Name,
                            Description = h.Description,
                            DaytimeOpen = h.DaytimeOpen,
                            DaytimeClose = h.DaytimeClose,
                            Cost = h.Cost,
                            Adress = h.Adress,
                            Contacts = h.Contacts,
                            IsAvalible = h.IsAvalible == 1,
                            ReviewCount = h.Reviews.Count()
                        };
            
            var totalCount = await query.CountAsync();
            var pageSize = sieveModel.PageSize ?? 10;
            var page = sieveModel.Page ?? 1;
            var skip = (page - 1) * pageSize;
            
            var hotels = await query.Skip(skip).Take(pageSize).ToListAsync();
            return (hotels, totalCount);
        }

        public async Task<HotelDto?> GetHotelByIdAsync(int id)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            return await context.Hotels.Where(h => h.Id == id).Select(MapToDto).FirstOrDefaultAsync();
        }

        public async Task<HotelDto> CreateHotelAsync(CreateHotelDto dto)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
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

            context.Hotels.Add(hotel);
            await context.SaveChangesAsync();
            _logger.LogInformation("Создан отель: {Name} (ID: {Id})", hotel.Name, hotel.Id);

            return await GetHotelByIdAsync(hotel.Id) ?? throw new InvalidOperationException();
        }

        public async Task<HotelDto?> UpdateHotelAsync(int id, UpdateHotelDto dto)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            var hotel = await context.Hotels.FindAsync(id);
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

            await context.SaveChangesAsync();
            return await GetHotelByIdAsync(id);
        }

        public async Task<bool> DeleteHotelAsync(int id)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            return await context.Hotels.Where(h => h.Id == id).ExecuteDeleteAsync() > 0;
        }

        public async Task<bool> CheckAvailabilityAsync(int hotelId, DateTime checkIn, DateTime checkOut)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            return await context.Hotels.AnyAsync(h => h.Id == hotelId && h.IsAvalible == 1);
        }

        public async Task<IEnumerable<HotelDto>> SearchHotelsAsync(string searchTerm)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            return await context.Hotels
                .Where(h => h.Name.Contains(searchTerm) || (h.Description != null && h.Description.Contains(searchTerm)))
                .Select(MapToDto)
                .ToListAsync();
        }

        public async Task<IEnumerable<HotelReviewDto>> GetHotelReviewsAsync(int hotelId)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            
            // Проверяем существование отеля
            var hotelExists = await context.Hotels.AnyAsync(h => h.Id == hotelId);
            if (!hotelExists) return Enumerable.Empty<HotelReviewDto>();

            // Пока возвращаем пустой список - Include() требует отдельного решения
            return Enumerable.Empty<HotelReviewDto>();
        }

        public async Task<HotelReviewDto> AddReviewAsync(int hotelId, int userId, CreateReviewDto dto)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            
            var hotel = await context.Hotels.FindAsync(hotelId);
            if (hotel is null) 
                throw new ArgumentException($"Отель с ID {hotelId} не найден");

            var now = DateTime.UtcNow;
            var review = new Review { Id = now, Date = now, Description = now };

            await context.Entry(hotel).Collection(h => h.Reviews).LoadAsync();
            hotel.Reviews.Add(review);
            
            await context.SaveChangesAsync();
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
            await using var context = await _contextFactory.CreateDbContextAsync();
            
            var favorite = await context.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ItemId == hotelId && f.ItemType == "hotel");
            
            if (favorite is not null)
            {
                context.Favorites.Remove(favorite);
                await context.SaveChangesAsync();
                return false;
            }

            context.Favorites.Add(new Favorite { UserId = userId, ItemType = "hotel", ItemId = hotelId, AddedDate = DateTime.UtcNow });
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> BookHotelAsync(int hotelId, int userId, HotelBookingDto dto)
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            
            var hotel = await context.Hotels.FindAsync(hotelId) 
                ?? throw new ArgumentException($"Отель с ID {hotelId} не найден");
            
            if (hotel.IsAvalible != 1) 
                throw new InvalidOperationException("Отель недоступен для бронирования");

            var user = await context.Users.FindAsync(userId) 
                ?? throw new ArgumentException($"Пользователь с ID {userId} не найден");

            await context.Entry(hotel).Collection(h => h.Users).LoadAsync();
            
            if (hotel.Users.Any(u => u.Id == userId))
            {
                _logger.LogWarning("Пользователь {UserId} уже имеет бронирование отеля {HotelId}", userId, hotelId);
                return false;
            }

            hotel.Users.Add(user);
            
            await context.SaveChangesAsync();
            _logger.LogInformation("Создано бронирование отеля {HotelId} пользователем {UserId}", hotelId, userId);
            return true;
        }
    }
}

