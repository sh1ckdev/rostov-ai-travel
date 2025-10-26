using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using WebApplication1.DTOs;
using WebApplication1.Models;

namespace WebApplication1.Services
{
    public interface IEventService
    {
        Task<(IEnumerable<EventDto> Events, int TotalCount)> GetEventsAsync(SieveModel sieveModel);
        Task<EventDto?> GetEventByIdAsync(int id);
        Task<EventDto> CreateEventAsync(CreateEventDto dto);
        Task<EventDto?> UpdateEventAsync(int id, UpdateEventDto dto);
        Task<bool> DeleteEventAsync(int id);
        Task<IEnumerable<EventCategoryDto>> GetCategoriesAsync();
        Task<IEnumerable<EventDto>> SearchEventsAsync(string searchTerm);
        Task<BookingResponseDto> BookEventAsync(int eventId, int userId, EventBookingDto dto);
        Task<BookingResponseDto?> UpdateBookingAsync(string bookingId, int userId, UpdateBookingDto dto);
        Task<bool> CancelBookingAsync(string bookingId, int userId);
        Task<bool> ToggleFavoriteAsync(int eventId, int userId);
    }

    public class EventService : IEventService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EventService> _logger;
        private readonly ISieveProcessor _sieveProcessor;

        private static readonly Func<Ivent, EventDto> MapToDto = e => new()
        {
            Id = e.Id,
            Name = e.Name,
            Description = e.Description,
            DatetimeOpen = e.DatetimeOpen,
            DatetimeClose = e.DatetimeClose,
            Cost = e.Cost,
            Adress = e.Adress,
            Contacts = e.Contacts,
            IsAvalible = e.IsAvalible == 1,
            AgeLimit = e.AgeLimit ?? 0
        };

        public EventService(ApplicationDbContext context, ILogger<EventService> logger, ISieveProcessor sieveProcessor) =>
            (_context, _logger, _sieveProcessor) = (context, logger, sieveProcessor);

        public async Task<(IEnumerable<EventDto> Events, int TotalCount)> GetEventsAsync(SieveModel sieveModel)
        {
            var query = _context.Ivents.AsQueryable();
            var totalCount = await _sieveProcessor.Apply(sieveModel, query, applyPagination: false).CountAsync();
            var events = await _sieveProcessor.Apply(sieveModel, query).Select(e => MapToDto(e)).ToListAsync();
            return (events, totalCount);
        }

        public async Task<EventDto?> GetEventByIdAsync(int id) =>
            await _context.Ivents.Where(e => e.Id == id).Select(e => MapToDto(e)).FirstOrDefaultAsync();

        public async Task<EventDto> CreateEventAsync(CreateEventDto dto)
        {
            var eventItem = new Ivent
            {
                Name = dto.Name,
                Description = dto.Description,
                DatetimeOpen = dto.DatetimeOpen,
                DatetimeClose = dto.DatetimeClose,
                Cost = dto.Cost,
                Adress = dto.Adress,
                Contacts = dto.Contacts,
                IsAvalible = 1,
                AgeLimit = dto.AgeLimit
            };

            _context.Ivents.Add(eventItem);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Создано мероприятие: {Name} (ID: {Id})", eventItem.Name, eventItem.Id);

            return await GetEventByIdAsync(eventItem.Id) ?? throw new InvalidOperationException();
        }

        public async Task<EventDto?> UpdateEventAsync(int id, UpdateEventDto dto)
        {
            var eventItem = await _context.Ivents.FindAsync(id);
            if (eventItem is null) return null;

            eventItem.Name = dto.Name;
            eventItem.Description = dto.Description;
            eventItem.DatetimeOpen = dto.DatetimeOpen;
            eventItem.DatetimeClose = dto.DatetimeClose;
            eventItem.Cost = dto.Cost;
            eventItem.Adress = dto.Adress;
            eventItem.Contacts = dto.Contacts;
            eventItem.AgeLimit = dto.AgeLimit;
            if (dto.IsAvalible.HasValue) eventItem.IsAvalible = dto.IsAvalible.Value ? (sbyte)1 : (sbyte)0;

            await _context.SaveChangesAsync();
            return MapToDto(eventItem);
        }

        public async Task<bool> DeleteEventAsync(int id) =>
            await _context.Ivents.Where(e => e.Id == id).ExecuteDeleteAsync() > 0;

        public async Task<IEnumerable<EventCategoryDto>> GetCategoriesAsync() =>
            await _context.Ivents
                .GroupBy(e => e.AgeLimit ?? 0)
                .Select(g => new EventCategoryDto
                {
                    Name = g.Key == 0 ? "Без ограничений" : 
                           g.Key == 6 ? "6+" :
                           g.Key == 12 ? "12+" :
                           g.Key == 16 ? "16+" :
                           g.Key == 18 ? "18+" : $"{g.Key}+",
                    Count = g.Count()
                })
                .ToListAsync();

        public async Task<IEnumerable<EventDto>> SearchEventsAsync(string searchTerm) =>
            await _context.Ivents
                .Where(e => e.Name.Contains(searchTerm) || (e.Description != null && e.Description.Contains(searchTerm)))
                .Select(e => MapToDto(e))
                .ToListAsync();

        public async Task<BookingResponseDto> BookEventAsync(int eventId, int userId, EventBookingDto dto)
        {
            var eventItem = await _context.Ivents.FindAsync(eventId) 
                ?? throw new ArgumentException($"Мероприятие с ID {eventId} не найдено");

            if (eventItem.IsAvalible != 1)
                throw new InvalidOperationException("Мероприятие уже забронировано");

            eventItem.IsAvalible = 0;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Забронировано мероприятие {EventId} пользователем {UserId}", eventId, userId);

            return new BookingResponseDto
            {
                BookingId = eventId.ToString(),
                EventId = eventId,
                EventName = eventItem.Name,
                UserId = userId,
                TicketsCount = dto.TicketsCount,
                BookingDate = dto.BookingDate,
                Status = "Confirmed",
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };
        }

        public async Task<BookingResponseDto?> UpdateBookingAsync(string bookingId, int userId, UpdateBookingDto dto)
        {
            if (!int.TryParse(bookingId, out int eventId))
                return null;

            var eventItem = await _context.Ivents.FindAsync(eventId);
            if (eventItem == null || eventItem.IsAvalible == 1)
                return null;

            _logger.LogInformation("Обновлено бронирование мероприятия {EventId}", eventId);

            return new BookingResponseDto
            {
                BookingId = bookingId,
                EventId = eventId,
                EventName = eventItem.Name,
                UserId = userId,
                TicketsCount = dto.TicketsCount ?? 1,
                BookingDate = dto.BookingDate ?? DateTime.UtcNow,
                Status = "Confirmed",
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };
        }

        public async Task<bool> CancelBookingAsync(string bookingId, int userId)
        {
            if (!int.TryParse(bookingId, out int eventId))
                return false;

            var eventItem = await _context.Ivents.FindAsync(eventId);
            if (eventItem == null)
                return false;

            eventItem.IsAvalible = 1;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Отменено бронирование мероприятия {EventId}", eventId);
            return true;
        }

        public async Task<bool> ToggleFavoriteAsync(int eventId, int userId)
        {
            var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ItemId == eventId && f.ItemType == "event");
            
            if (favorite is not null)
            {
                _context.Favorites.Remove(favorite);
                await _context.SaveChangesAsync();
                return false;
            }

            _context.Favorites.Add(new Favorite { UserId = userId, ItemType = "event", ItemId = eventId, AddedDate = DateTime.UtcNow });
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

