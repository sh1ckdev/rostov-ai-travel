using System.ComponentModel.DataAnnotations;

namespace WebApplication1.DTOs
{
    public class HotelDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TimeOnly? DaytimeOpen { get; set; }
        public TimeOnly? DaytimeClose { get; set; }
        public string? Cost { get; set; }
        public string? Adress { get; set; }
        public string? Contacts { get; set; }
        public bool IsAvalible { get; set; } = true;
    }

    public class CreateHotelDto
    {
        [Required(ErrorMessage = "Название обязательно")]
        [MaxLength(45)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public TimeOnly? DaytimeOpen { get; set; }
        public TimeOnly? DaytimeClose { get; set; }

        [MaxLength(45)]
        public string? Cost { get; set; }

        [MaxLength(45)]
        public string? Adress { get; set; }

        [MaxLength(45)]
        public string? Contacts { get; set; }
    }

    public class UpdateHotelDto : CreateHotelDto
    {
        public bool? IsAvalible { get; set; }
    }

    public class HotelFilterDto
    {
        public string? Name { get; set; }
        public string? Cost { get; set; }
        public bool? IsAvalible { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class HotelBookingDto
    {
        [Required]
        public int HotelId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }

        public string? Notes { get; set; }
    }

    public class HotelReviewDto
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; }
    }

    public class CreateReviewDto
    {
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }
}

