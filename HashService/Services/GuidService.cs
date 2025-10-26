using System.Security.Cryptography;

namespace HashService.Services
{
    public interface IGuidService 
    {
        string GetGuid();
    }
    public class GuidService : IGuidService
    {
        //генерация уникального guid с временной меткой
        public string GetGuid() 
        {
            Guid baseGuid = Guid.NewGuid();
            long timestamp = DateTime.UtcNow.Ticks; // Точная временная метка

            using (var sha = SHA256.Create())
            {
                byte[] bytes = sha.ComputeHash(
                    BitConverter.GetBytes(timestamp).Concat(baseGuid.ToByteArray()).ToArray()
                );
                return new Guid(bytes.Take(16).ToArray()).ToString();
            }
        }
    }
}
