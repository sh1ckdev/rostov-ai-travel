using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace HashService.Services
{
    public interface IHash
    {
        public string GetSha256HashText(string text, byte[] salt);
        public string GetMD5HashText(string text, byte[] salt);
        public byte[] GenerateSalt();

    }
    public class Hash: IHash
    {
        public byte[] GenerateSalt()
        {
            const int SaltLength = 64;
            byte[] salt = new byte[SaltLength];

            using (var rngRand = RandomNumberGenerator.Create())
                rngRand.GetBytes(salt);

            return salt;
        }
        private byte[] GenerateMD5Hash(string text, byte[] salt)
        {
            byte[] passwordBytes = Encoding.UTF8.GetBytes(text);
            byte[] saltedPassword = Combine(salt, passwordBytes);

            using (var hash = MD5.Create())
                return hash.ComputeHash(saltedPassword);
        }
        private byte[] GenerateSha256Hash(string text, byte[] salt)
        {
            byte[] passwordBytes = Encoding.UTF8.GetBytes(text);
            byte[] saltedPassword = Combine(salt, passwordBytes);

            using (var hash = SHA256.Create())
                return hash.ComputeHash(saltedPassword);
        }
        public byte[] Combine(byte[] first, byte[] second)
        {
            byte[] ret = new byte[first.Length + second.Length];
            Buffer.BlockCopy(first, 0, ret, 0, first.Length);
            Buffer.BlockCopy(second, 0, ret, first.Length, second.Length);
            return ret;
        }
        public string GetSha256HashText(string text, byte[] salt)
        {
            return Convert.ToBase64String(GenerateSha256Hash(text, salt));
        }
        public string GetMD5HashText(string text, byte[] salt)
        {
            return Convert.ToBase64String(GenerateMD5Hash(text, salt));
        }
    }
}
