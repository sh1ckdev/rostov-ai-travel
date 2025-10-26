using HashService.Services;
using Microsoft.Extensions.DependencyInjection;

namespace HashService
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddAppServices(this IServiceCollection services)
        {
            return services.AddScoped<IHash, Hash>()
                           .AddScoped<IGuidService, GuidService>();
                
        }
    }
}
