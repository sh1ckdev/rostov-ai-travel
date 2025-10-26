namespace WebApplication1.DTOs
{
    public class RecommendationUserRequest
    {
        public string Location { get; set; }
    }

    public class StartChatUserRequest
    {
        public string Location { get; set; }
    }

    public class ChatMessageUserRequest
    {
        public string SessionId { get; set; }
        public string Message { get; set; }
    }
}
