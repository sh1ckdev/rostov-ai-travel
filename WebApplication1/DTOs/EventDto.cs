using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs
{
    public class EventDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TimeOnly? DatetimeOpen { get; set; }
        public TimeOnly? DatetimeClose { get; set; }
        public string? Cost { get; set; }
        public string? Adress { get; set; }
        public string? Contacts { get; set; }
        public bool IsAvalible { get; set; } = true;
        public int AgeLimit { get; set; }
    }

    public class CreateEventDto
    {
        [Required(ErrorMessage = "Название обязательно")]
        [MaxLength(45)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public TimeOnly? DatetimeOpen { get; set; }
        public TimeOnly? DatetimeClose { get; set; }

        [MaxLength(45)]
        public string? Cost { get; set; }

        [MaxLength(45)]
        public string? Adress { get; set; }

        [MaxLength(45)]
        public string? Contacts { get; set; }

        [Range(0, 21, ErrorMessage = "Возрастное ограничение от 0 до 21")]
        public int AgeLimit { get; set; } = 0;
    }

    public class UpdateEventDto : CreateEventDto
    {
        public bool? IsAvalible { get; set; }
    }

    public class EventFilterDto
    {
        public string? Name { get; set; }
        public string? Category { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public bool? IsAvalible { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class EventBookingDto
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Количество билетов от 1 до 100")]
        public int TicketsCount { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        public string? Notes { get; set; }
    }

    public class UpdateBookingDto
    {
        [Range(1, 100, ErrorMessage = "Количество билетов от 1 до 100")]
        public int? TicketsCount { get; set; }

        public DateTime? BookingDate { get; set; }

        public string? Notes { get; set; }
    }

    public class EventCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class BookingResponseDto
    {
        public string BookingId { get; set; } = string.Empty;
        public int EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int TicketsCount { get; set; }
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

