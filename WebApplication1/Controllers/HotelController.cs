using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;
using WebApplication1.DTOs;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelService _hotelService;
        private readonly ILogger<HotelsController> _logger;

        public HotelsController(IHotelService hotelService, ILogger<HotelsController> logger) =>
            (_hotelService, _logger) = (hotelService, logger);

        [HttpGet]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHotels([FromQuery] SieveModel sieveModel)
        {
            var (hotels, totalCount) = await _hotelService.GetHotelsAsync(sieveModel);
            
            var pageSize = sieveModel.PageSize ?? 10;
            var page = sieveModel.Page ?? 1;
            
            return Ok(new
            {
                data = hotels,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(HotelDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetHotel(int id)
        {
            var hotel = await _hotelService.GetHotelByIdAsync(id);
            return hotel is null ? NotFound(new { message = $"Отель с ID {id} не найден" }) : Ok(hotel);
        }

        [Authorize]
        [HttpPost]
        [ProducesResponseType(typeof(HotelDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateHotel([FromBody] CreateHotelDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var hotel = await _hotelService.CreateHotelAsync(dto);
            return CreatedAtAction(nameof(GetHotel), new { id = hotel.Id }, hotel);
        }

        [Authorize]
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(HotelDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateHotel(int id, [FromBody] UpdateHotelDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var hotel = await _hotelService.UpdateHotelAsync(id, dto);
            return hotel is null ? NotFound(new { message = $"Отель с ID {id} не найден" }) : Ok(hotel);
        }

        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var result = await _hotelService.DeleteHotelAsync(id);
            if (!result)
                return NotFound(new { message = $"Отель с ID {id} не найден" });

            return NoContent();
        }

        /// <summary>
        /// Проверить доступность дат
        /// </summary>
        [HttpGet("availability")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> CheckAvailability(
            [FromQuery] int hotelId,
            [FromQuery] DateTime checkIn,
            [FromQuery] DateTime checkOut)
        {
            if (checkIn >= checkOut)
                return BadRequest(new { message = "Дата заезда должна быть раньше даты выезда" });

            var isAvailable = await _hotelService.CheckAvailabilityAsync(hotelId, checkIn, checkOut);
            
            return Ok(new
            {
                hotelId,
                checkIn,
                checkOut,
                isAvailable,
                message = isAvailable ? "Отель доступен" : "Отель недоступен в указанные даты"
            });
        }

        /// <summary>
        /// Поиск отелей по названию
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<HotelDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchHotels([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Поисковый запрос не может быть пустым" });

            var hotels = await _hotelService.SearchHotelsAsync(query);
            return Ok(hotels);
        }

        /// <summary>
        /// Получить отзывы об отеле
        /// </summary>
        [HttpGet("{id}/reviews")]
        [ProducesResponseType(typeof(IEnumerable<HotelReviewDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHotelReviews(int id)
        {
            var reviews = await _hotelService.GetHotelReviewsAsync(id);
            return Ok(reviews);
        }

        /// <summary>
        /// Добавить отзыв
        /// </summary>
        [Authorize]
        [HttpPost("{id}/reviews")]
        [ProducesResponseType(typeof(HotelReviewDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AddReview(int id, [FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Не удалось определить пользователя" });

            var review = await _hotelService.AddReviewAsync(id, userId, dto);
            return CreatedAtAction(nameof(GetHotelReviews), new { id }, review);
        }

        /// <summary>
        /// Забронировать отель
        /// </summary>
        [Authorize]
        [HttpPost("{id}/book")]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BookHotel(int id, [FromBody] HotelBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.CheckInDate >= dto.CheckOutDate)
                return BadRequest(new { message = "Дата заезда должна быть раньше даты выезда" });

            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Не удалось определить пользователя" });

            try
            {
                var result = await _hotelService.BookHotelAsync(id, userId, dto);
                if (!result) return BadRequest(new { message = "У вас уже есть бронирование этого отеля" });

                return CreatedAtAction(nameof(GetHotel), new { id }, new
                {
                    hotelId = id,
                    userId,
                    checkInDate = dto.CheckInDate,
                    checkOutDate = dto.CheckOutDate,
                    status = "Confirmed",
                    message = "Бронирование успешно создано"
                });
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
        /// Добавить/удалить из избранного
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

            var added = await _hotelService.ToggleFavoriteAsync(id, userId);

            return Ok(new
            {
                hotelId = id,
                isFavorite = added,
                message = added ? "Добавлено в избранное" : "Удалено из избранного"
            });
        }

        /// <summary>
        /// Удалить из избранного (альтернативный endpoint)
        /// </summary>
        [Authorize]
        [HttpDelete("{id}/favorite")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RemoveFromFavorite(int id)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Не удалось определить пользователя" });

            await _hotelService.ToggleFavoriteAsync(id, userId);
            return NoContent();
        }
    }
}

