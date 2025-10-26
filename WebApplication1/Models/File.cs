using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class File
{
    public int Id { get; set; }

    public string Ext { get; set; } = null!;

    public byte[] Data { get; set; } = null!;

    public string? Filescol { get; set; }

    public string? Filescol1 { get; set; }

    public virtual ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();

    public virtual ICollection<Ivent> Ivents { get; set; } = new List<Ivent>();
}
