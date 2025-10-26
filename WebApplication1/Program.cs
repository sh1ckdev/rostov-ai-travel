using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Sieve.Models;
using Sieve.Services;
using System.Text;
using WebApplication1.Models;
using WebApplication1.Services;
using WebApplication1.Servises;

var builder = WebApplication.CreateBuilder(args);

// Регистрация DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "server=mysql;port=3306;user=root;database=db;password=root",
        Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.11.14-mariadb")
    )
);

// Конфигурация AuthOptions
var authOptions = new AuthOptions
{
    SecretKey = builder.Configuration["JwtSettings:SecretKey"] ?? "DefaultSecretKey2024!@#$%^&*()_+SecureKeyMinimum32Chars",
    Issuer = builder.Configuration["JwtSettings:Issuer"] ?? "WebApi",
    Audience = builder.Configuration["JwtSettings:Audience"] ?? "WebApiUsers",
    TokenLifetime = int.Parse(builder.Configuration["JwtSettings:TokenLifetime"] ?? "60"),
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateIssuerSigningKey = true
};

builder.Services.AddSingleton(authOptions);

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = authOptions.ValidateIssuer,
            ValidIssuer = authOptions.Issuer,
            ValidateAudience = authOptions.ValidateAudience,
            ValidAudience = authOptions.Audience,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authOptions.SecretKey)),
            ValidateIssuerSigningKey = authOptions.ValidateIssuerSigningKey,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// HTTP клиент для HashService
var hashServiceUrl = builder.Configuration["HashServiceUrl"] ?? "http://hashservice";
builder.Services.AddHttpClient<IHashService, HashServiceClient>(client =>
{
    client.BaseAddress = new Uri(hashServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

//builder.Services.AddHttpClient();
builder.Services.AddSingleton<AiClient>(provider =>
    new AiClient("http://webapplication2:8080")); // URL вашего основного API

// Регистрация Sieve для фильтрации, сортировки и пагинации
builder.Services.Configure<SieveOptions>(builder.Configuration.GetSection("Sieve"));
builder.Services.AddScoped<ISieveProcessor, SieveProcessor>();

// Регистрация сервисов
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IHotelService, HotelService>();
builder.Services.AddScoped<IEventService, EventService>();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "WebApplication1 API",
        Version = "v1",
        Description = "API для управления отелями, событиями и ресторанами"
    });

    // Настройка JWT авторизации в Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введите JWT токен в формате: Bearer {ваш токен}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

