namespace WebApplication2.DTOs
{
    public class ChatSession
    {
        public string SessionId { get; set; }
        public string UserLocation { get; set; }
        public List<Hotel> Hotels { get; set; }
        public List<ChatMessage> MessageHistory { get; set; } = new();
    }

    public class ChatMessage
    {
        public string Role { get; set; } // "user" или "assistant"
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
    }

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

    //public class ChatResponse
    //{
    //    public string Response { get; set; }
    //    public string SessionId { get; set; }
    //}
    public class ChatResponse
    {
        public string SessionId { get; set; }
        public string Response { get; set; }
        public List<MessageDto> FullHistory { get; set; } // Вся история диалога
    }

    public class MessageDto
    {
        public string Role { get; set; } // "user" или "assistant"
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
