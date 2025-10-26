using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Restaurant
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public TimeOnly? DatetimeOpen { get; set; }

    public TimeOnly? DatetimeClose { get; set; }

    public string? Cost { get; set; }

    public string? Adress { get; set; }

    public string? Contacts { get; set; }

    public sbyte IsAvalible { get; set; }

    public string KitchenType { get; set; } = null!;

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
