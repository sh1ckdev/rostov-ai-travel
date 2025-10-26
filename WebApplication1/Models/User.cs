using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models;

public partial class User
{
    public int Id { get; set; }

    public string? FirstName { get; set; }

    public string? SecondName { get; set; }

    public string? LastName { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? ExpirationDate { get; set; }

    public string? Password { get; set; }

    public byte[]? Salt { get; set; }

    public string? Location { get; set; }

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();

    // Вычисляемые свойства для удобной работы с авторизацией
    [NotMapped]
    public string Login 
    { 
        get => FirstName ?? string.Empty;
        set => FirstName = value;
    }
    
    [NotMapped]
    public string? Email 
    { 
        get => LastName;
        set => LastName = value;
    }
    
    [NotMapped]
    public string? FullName 
    { 
        get => SecondName;
        set => SecondName = value;
    }
    
    [NotMapped]
    public DateTime? RefreshTokenExpires 
    { 
        get => ExpirationDate;
        set => ExpirationDate = value;
    }
}
