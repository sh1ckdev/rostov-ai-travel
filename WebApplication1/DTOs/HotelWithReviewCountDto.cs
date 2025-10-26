namespace WebApplication1.DTOs
{
    public class HotelWithReviewCountDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public TimeOnly? DaytimeOpen { get; set; }
        public TimeOnly? DaytimeClose { get; set; }
        public decimal? Cost { get; set; }
        public string? Adress { get; set; }
        public string? Contacts { get; set; }
        public bool IsAvalible { get; set; }
        public int ReviewCount { get; set; }
    }
}

