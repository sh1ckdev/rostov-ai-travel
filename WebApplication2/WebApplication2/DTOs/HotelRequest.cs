namespace WebApplication2.DTOs
{
    public class HotelRequest
    {
        public string UserQuery { get; set; }
        public string UserLocation { get; set; }
        public List<Hotel> Hotels { get; set; }
    }

    public class Hotel
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public int ReviewCount { get; set; }
    }
}
