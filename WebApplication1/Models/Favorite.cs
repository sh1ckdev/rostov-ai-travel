using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class Favorite
{
    public int UserId { get; set; }

    public string ItemType { get; set; } = null!;

    public int ItemId { get; set; }

    public DateTime? AddedDate { get; set; }

    public virtual User User { get; set; } = null!;
}
