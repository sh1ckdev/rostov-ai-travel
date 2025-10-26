using Sieve.Attributes;
using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Hotel
{
    [Sieve(CanFilter = true, CanSort = true)]
    public int Id { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Name { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public TimeOnly? DaytimeOpen { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public TimeOnly? DaytimeClose { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Cost { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Adress { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Contacts { get; set; }

    [Sieve(CanFilter = true, CanSort = true, Name = "IsAvailable")]
    public sbyte IsAvalible { get; set; }

    public virtual ICollection<File> Files { get; set; } = new List<File>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
