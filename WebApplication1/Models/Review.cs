using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Review
{
    public DateTime Id { get; set; }

    public DateTime? Description { get; set; }

    public DateTime? Date { get; set; }

    public virtual ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();

    public virtual ICollection<Ivent> Ivents { get; set; } = new List<Ivent>();

    public virtual ICollection<Restaurant> Restaurants { get; set; } = new List<Restaurant>();
}
