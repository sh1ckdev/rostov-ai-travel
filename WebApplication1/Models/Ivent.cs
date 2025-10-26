using Sieve.Attributes;
using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Ivent
{
    [Sieve(CanFilter = true, CanSort = true)]
    public int Id { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = null!;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public TimeOnly? DatetimeOpen { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public TimeOnly? DatetimeClose { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Cost { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Adress { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Contacts { get; set; }

    [Sieve(CanFilter = true, CanSort = true, Name = "IsAvailable")]
    public sbyte IsAvalible { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int? AgeLimit { get; set; }

    public virtual ICollection<File> Files { get; set; } = new List<File>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
