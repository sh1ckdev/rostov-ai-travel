using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;
using WebApplication1.DTOs;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly ILogger<EventsController> _logger;

        public EventsController(IEventService eventService, ILogger<EventsController> logger) =>
            (_eventService, _logger) = (eventService, logger);

        /// <summary>
        /// Получить афишу мероприятий с фильтрацией, сортировкой и пагинацией через Sieve
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetEvents([FromQuery] SieveModel sieveModel)
        {
            var (events, totalCount) = await _eventService.GetEventsAsync(sieveModel);
            
            var pageSize = sieveModel.PageSize ?? 10;
            var page = sieveModel.Page ?? 1;
            
            return Ok(new
            {
                data = events,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        /// <summary>
        /// Детали мероприятия
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetEvent(int id)
        {
            var eventItem = await _eventService.GetEventByIdAsync(id);
            return eventItem is null ? NotFound(new { message = $"Мероприятие с ID {id} не найдено" }) : Ok(eventItem);
        }

        /// <summary>
        /// Список категорий
        /// </summary>
        [HttpGet("categories")]
        [ProducesResponseType(typeof(IEnumerable<EventCategoryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _eventService.GetCategoriesAsync();
            return Ok(categories);
        }

        /// <summary>
        /// Поиск мероприятий
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<EventDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchEvents([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Поисковый запрос не может быть пустым" });

            var events = await _eventService.SearchEventsAsync(query);
            return Ok(events);
        }

        /// <summary>
        /// Забронировать билеты (требуется авторизация)
        /// </summary>
        [Authorize]
        [HttpPost("{id}/book")]
        [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BookEvent(int id, [FromBody] EventBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Не удалось определить пользователя" });

            try
            {
                var booking = await _eventService.BookEventAsync(id, userId, dto);
                return CreatedAtAction(nameof(GetEvent), new { id }, booking);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Добавить в избранное (требуется авторизация)
        /// </summary>
        [Authorize]
        [HttpPost("{id}/favorite")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ToggleFavorite(int id)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Не удалось определить пользователя" });

            var added = await _eventService.ToggleFavoriteAsync(id, userId);

            return Ok(new
            {
                eventId = id,
                isFavorite = added,
                message = added ? "Добавлено в избранное" : "Удалено из избранного"
            });
        }

        /// <summary>
        /// Изменить бронирование (требуется авторизация)
        /// </summary>
        [Authorize]
        [HttpPut("bookings/{bookingId}")]
        [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateBooking(string bookingId, [FromBody] UpdateBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Не удалось определить пользователя" });

            try
            {
                var booking = await _eventService.UpdateBookingAsync(bookingId, userId, dto);
                if (booking == null)
                    return NotFound(new { message = $"Бронирование {bookingId} не найдено" });

                return Ok(booking);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        /// <summary>
        /// Отменить бронирование (требуется авторизация)
        /// </summary>
        [Authorize]
        [HttpDelete("bookings/{bookingId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CancelBooking(string bookingId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Не удалось определить пользователя" });

            try
            {
                var result = await _eventService.CancelBookingAsync(bookingId, userId);
                if (!result)
                    return NotFound(new { message = $"Бронирование {bookingId} не найдено" });

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        /// <summary>
        /// Создать мероприятие (только для администраторов)
        /// </summary>
        [Authorize]
        [HttpPost]
        [ProducesResponseType(typeof(EventDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var eventItem = await _eventService.CreateEventAsync(dto);
            return CreatedAtAction(nameof(GetEvent), new { id = eventItem.Id }, eventItem);
        }

        /// <summary>
        /// Обновить мероприятие (только для администраторов)
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] UpdateEventDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var eventItem = await _eventService.UpdateEventAsync(id, dto);
            return eventItem is null ? NotFound(new { message = $"Мероприятие с ID {id} не найдено" }) : Ok(eventItem);
        }

        /// <summary>
        /// Удалить мероприятие (только для администраторов)
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var result = await _eventService.DeleteEventAsync(id);
            if (!result)
                return NotFound(new { message = $"Мероприятие с ID {id} не найдено" });

            return NoContent();
        }
    }
}

