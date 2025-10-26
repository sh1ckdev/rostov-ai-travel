using HashService.Services;
using Microsoft.AspNetCore.Mvc;

namespace HashService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HashController : Controller
    {
        private readonly IHash _calc;

        public HashController(IHash calc)
        {
            _calc = calc;
        }

        [HttpPost("sha256")]
        public IActionResult GetSha256([FromBody] SourceHashModel sourceHashModel)
        {
            if (string.IsNullOrEmpty(sourceHashModel.Text) || sourceHashModel.Salt == null)
                return NoContent();

            return Ok(_calc.GetSha256HashText(sourceHashModel.Text, sourceHashModel.Salt));
        }

        [HttpPost("md5")]
        public IActionResult GetMD5([FromBody] SourceHashModel sourceHashModel)
        {
            if (string.IsNullOrEmpty(sourceHashModel.Text) || sourceHashModel.Salt == null)
                return NoContent();

            return Ok(_calc.GetMD5HashText(sourceHashModel.Text, sourceHashModel.Salt));
        }

        [HttpGet("salt")]
        public IActionResult GetSalt() => Ok(_calc.GenerateSalt());
    }
}
