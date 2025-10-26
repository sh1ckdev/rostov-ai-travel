namespace WebApplication1.DTOs
{
    // Модели для RecommendController
    public class HotelRequest
    {
        public string UserQuery { get; set; }
        public string UserLocation { get; set; }
        public List<Hotel> Hotels { get; set; }
    }

    public class ApiResponse
    {
        public string Response { get; set; }
    }

    // Модели для ChatController
    public class StartChatRequest
    {
        public string UserLocation { get; set; }
        public List<Hotel> Hotels { get; set; }
    }

    public class ChatMessageRequest
    {
        public string SessionId { get; set; }
        public string Message { get; set; }
    }

    public class MessageDto
    {
        public string Role { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class ChatResponse
    {
        public string SessionId { get; set; }
        public string Response { get; set; }
        public List<MessageDto> FullHistory { get; set; }
    }

    // Общая модель
    public class Hotel
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public int ReviewCount { get; set; }
    }

}
