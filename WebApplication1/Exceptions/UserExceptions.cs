namespace WebApplication1.Exceptions
{
    public class InvalidCredentialsException : Exception
    {
        public InvalidCredentialsException() : base("Неверные учетные данные")
        {
        }

        public InvalidCredentialsException(string message) : base(message)
        {
        }
    }

    public class UserAlreadyExistsException : Exception
    {
        public UserAlreadyExistsException(string login) 
            : base($"Пользователь с логином '{login}' уже существует")
        {
        }
    }

    public class UserNotFoundException : Exception
    {
        public UserNotFoundException(string login) 
            : base($"Пользователь с логином '{login}' не найден")
        {
        }

        public UserNotFoundException(int id) 
            : base($"Пользователь с ID {id} не найден")
        {
        }
    }
}

