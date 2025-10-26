using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace WebApplication1.Models;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Favorite> Favorites { get; set; } = null!;

    public virtual DbSet<File> Files { get; set; } = null!;

    public virtual DbSet<Hotel> Hotels { get; set; } = null!;

    public virtual DbSet<Ivent> Ivents { get; set; } = null!;

    public virtual DbSet<Restaurant> Restaurants { get; set; } = null!;

    public virtual DbSet<Review> Reviews { get; set; } = null!;

    public virtual DbSet<User> Users { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseMySql(
                "server=mysql;port=3306;user=root;database=db;password=root",
                Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.11.14-mariadb")
            );
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_general_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.ItemType, e.ItemId })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0, 0 });

            entity.ToTable("favorites");

            entity.HasIndex(e => e.UserId, "fk_favorites_user_idx");

            entity.Property(e => e.UserId)
                .HasColumnType("int(11)")
                .HasColumnName("user_id");
            entity.Property(e => e.ItemType)
                .HasColumnType("enum('hotel','restaurant','ivent')")
                .HasColumnName("item_type");
            entity.Property(e => e.ItemId)
                .HasColumnType("int(11)")
                .HasColumnName("item_id");
            entity.Property(e => e.AddedDate)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime")
                .HasColumnName("added_date");

            entity.HasOne(d => d.User).WithMany(p => p.Favorites)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_favorites_user");
        });

        modelBuilder.Entity<File>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity
                .ToTable("files")
                .HasCharSet("utf8mb3")
                .UseCollation("utf8mb3_general_ci");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.Data).HasColumnName("data");
            entity.Property(e => e.Ext)
                .HasMaxLength(45)
                .HasColumnName("ext");
            entity.Property(e => e.Filescol)
                .HasMaxLength(45)
                .HasColumnName("filescol");
            entity.Property(e => e.Filescol1)
                .HasMaxLength(45)
                .HasColumnName("filescol1");

            entity.HasMany(d => d.Hotels).WithMany(p => p.Files)
                .UsingEntity<Dictionary<string, object>>(
                    "FilesHasHotel",
                    r => r.HasOne<Hotel>().WithMany()
                        .HasForeignKey("HotelId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_files_has_hotel_hotel1"),
                    l => l.HasOne<File>().WithMany()
                        .HasForeignKey("FilesId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_files_has_hotel_files1"),
                    j =>
                    {
                        j.HasKey("FilesId", "HotelId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j
                            .ToTable("files_has_hotel")
                            .HasCharSet("utf8mb3")
                            .UseCollation("utf8mb3_general_ci");
                        j.HasIndex(new[] { "FilesId" }, "fk_files_has_hotel_files1_idx");
                        j.HasIndex(new[] { "HotelId" }, "fk_files_has_hotel_hotel1_idx");
                        j.IndexerProperty<int>("FilesId")
                            .HasColumnType("int(11)")
                            .HasColumnName("files_id");
                        j.IndexerProperty<int>("HotelId")
                            .HasColumnType("int(11)")
                            .HasColumnName("hotel_id");
                    });

            entity.HasMany(d => d.Ivents).WithMany(p => p.Files)
                .UsingEntity<Dictionary<string, object>>(
                    "FilesHasIvent",
                    r => r.HasOne<Ivent>().WithMany()
                        .HasForeignKey("IventsId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_files_has_ivents_ivents1"),
                    l => l.HasOne<File>().WithMany()
                        .HasForeignKey("FilesId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_files_has_ivents_files1"),
                    j =>
                    {
                        j.HasKey("FilesId", "IventsId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j
                            .ToTable("files_has_ivents")
                            .HasCharSet("utf8mb3")
                            .UseCollation("utf8mb3_general_ci");
                        j.HasIndex(new[] { "FilesId" }, "fk_files_has_ivents_files1_idx");
                        j.HasIndex(new[] { "IventsId" }, "fk_files_has_ivents_ivents1_idx");
                        j.IndexerProperty<int>("FilesId")
                            .HasColumnType("int(11)")
                            .HasColumnName("files_id");
                        j.IndexerProperty<int>("IventsId")
                            .HasColumnType("int(11)")
                            .HasColumnName("ivents_id");
                    });
        });

        modelBuilder.Entity<Hotel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("hotel");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.Adress)
                .HasMaxLength(45)
                .HasColumnName("adress");
            entity.Property(e => e.Contacts)
                .HasMaxLength(45)
                .HasColumnName("contacts");
            entity.Property(e => e.Cost)
                .HasMaxLength(45)
                .HasColumnName("cost");
            entity.Property(e => e.DaytimeClose)
                .HasColumnType("time")
                .HasColumnName("daytime_close");
            entity.Property(e => e.DaytimeOpen)
                .HasColumnType("time")
                .HasColumnName("daytime_open");
            entity.Property(e => e.Description)
                .HasMaxLength(200)
                .HasColumnName("description");
            entity.Property(e => e.IsAvalible)
                .HasDefaultValueSql("'1'")
                .HasColumnType("tinyint(4)")
                .HasColumnName("is_avalible");
            entity.Property(e => e.Name)
                .HasMaxLength(45)
                .HasColumnName("name");

            entity.HasMany(d => d.Reviews).WithMany(p => p.Hotels)
                .UsingEntity<Dictionary<string, object>>(
                    "HotelHasReview",
                    r => r.HasOne<Review>().WithMany()
                        .HasForeignKey("ReviewsId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_hotel_has_reviews_reviews1"),
                    l => l.HasOne<Hotel>().WithMany()
                        .HasForeignKey("HotelId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_hotel_has_reviews_hotel1"),
                    j =>
                    {
                        j.HasKey("HotelId", "ReviewsId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("hotel_has_reviews");
                        j.HasIndex(new[] { "HotelId" }, "fk_hotel_has_reviews_hotel1_idx");
                        j.HasIndex(new[] { "ReviewsId" }, "fk_hotel_has_reviews_reviews1_idx");
                        j.IndexerProperty<int>("HotelId")
                            .HasColumnType("int(11)")
                            .HasColumnName("hotel_id");
                        j.IndexerProperty<DateTime>("ReviewsId")
                            .HasColumnType("timestamp")
                            .HasColumnName("reviews_id");
                    });
        });

        modelBuilder.Entity<Ivent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("ivent");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.Adress)
                .HasMaxLength(45)
                .HasColumnName("adress");
            entity.Property(e => e.AgeLimit)
                .HasDefaultValueSql("'0'")
                .HasColumnType("int(11)")
                .HasColumnName("age_limit");
            entity.Property(e => e.Contacts)
                .HasMaxLength(45)
                .HasColumnName("contacts");
            entity.Property(e => e.Cost)
                .HasMaxLength(45)
                .HasColumnName("cost");
            entity.Property(e => e.DatetimeClose)
                .HasColumnType("time")
                .HasColumnName("datetime_close");
            entity.Property(e => e.DatetimeOpen)
                .HasColumnType("time")
                .HasColumnName("datetime_open");
            entity.Property(e => e.Description)
                .HasMaxLength(200)
                .HasColumnName("description");
            entity.Property(e => e.IsAvalible)
                .HasDefaultValueSql("'1'")
                .HasColumnType("tinyint(4)")
                .HasColumnName("is_avalible");
            entity.Property(e => e.Name)
                .HasMaxLength(45)
                .HasColumnName("name");

            entity.HasMany(d => d.Reviews).WithMany(p => p.Ivents)
                .UsingEntity<Dictionary<string, object>>(
                    "IventHasReview",
                    r => r.HasOne<Review>().WithMany()
                        .HasForeignKey("ReviewsId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_ivent_has_reviews_reviews1"),
                    l => l.HasOne<Ivent>().WithMany()
                        .HasForeignKey("IventId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_ivent_has_reviews_ivent1"),
                    j =>
                    {
                        j.HasKey("IventId", "ReviewsId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("ivent_has_reviews");
                        j.HasIndex(new[] { "IventId" }, "fk_ivent_has_reviews_ivent1_idx");
                        j.HasIndex(new[] { "ReviewsId" }, "fk_ivent_has_reviews_reviews1_idx");
                        j.IndexerProperty<int>("IventId")
                            .HasColumnType("int(11)")
                            .HasColumnName("ivent_id");
                        j.IndexerProperty<DateTime>("ReviewsId")
                            .HasColumnType("timestamp")
                            .HasColumnName("reviews_id");
                    });
        });

        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("restaurant");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.Adress)
                .HasMaxLength(45)
                .HasColumnName("adress");
            entity.Property(e => e.Contacts)
                .HasMaxLength(45)
                .HasColumnName("contacts");
            entity.Property(e => e.Cost)
                .HasMaxLength(45)
                .HasColumnName("cost");
            entity.Property(e => e.DatetimeClose)
                .HasColumnType("time")
                .HasColumnName("datetime_close");
            entity.Property(e => e.DatetimeOpen)
                .HasColumnType("time")
                .HasColumnName("datetime_open");
            entity.Property(e => e.Description)
                .HasMaxLength(200)
                .HasColumnName("description");
            entity.Property(e => e.IsAvalible)
                .HasDefaultValueSql("'1'")
                .HasColumnType("tinyint(4)")
                .HasColumnName("is_avalible");
            entity.Property(e => e.KitchenType)
                .HasMaxLength(45)
                .HasDefaultValueSql("'Русская'")
                .HasColumnName("kitchen_type");
            entity.Property(e => e.Name)
                .HasMaxLength(45)
                .HasColumnName("name");

            entity.HasMany(d => d.Reviews).WithMany(p => p.Restaurants)
                .UsingEntity<Dictionary<string, object>>(
                    "RestaurantHasReview",
                    r => r.HasOne<Review>().WithMany()
                        .HasForeignKey("ReviewsId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_restaurant_has_reviews_reviews1"),
                    l => l.HasOne<Restaurant>().WithMany()
                        .HasForeignKey("RestaurantId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_restaurant_has_reviews_restaurant1"),
                    j =>
                    {
                        j.HasKey("RestaurantId", "ReviewsId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("restaurant_has_reviews");
                        j.HasIndex(new[] { "RestaurantId" }, "fk_restaurant_has_reviews_restaurant1_idx");
                        j.HasIndex(new[] { "ReviewsId" }, "fk_restaurant_has_reviews_reviews1_idx");
                        j.IndexerProperty<int>("RestaurantId")
                            .HasColumnType("int(11)")
                            .HasColumnName("restaurant_id");
                        j.IndexerProperty<DateTime>("ReviewsId")
                            .HasColumnType("timestamp")
                            .HasColumnName("reviews_id");
                    });
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity
                .ToTable("reviews")
                .HasCharSet("utf8mb3")
                .UseCollation("utf8mb3_general_ci");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("timestamp")
                .HasColumnName("id");
            entity.Property(e => e.Date)
                .HasColumnType("datetime")
                .HasColumnName("date");
            entity.Property(e => e.Description)
                .HasColumnType("timestamp")
                .HasColumnName("description");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.ExpirationDate)
                .HasColumnType("datetime")
                .HasColumnName("expiration_date");
            entity.Property(e => e.FirstName)
                .HasMaxLength(45)
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(45)
                .HasColumnName("last_name");
            entity.Property(e => e.Location)
                .HasMaxLength(45)
                .HasColumnName("location");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.RefreshToken)
                .HasMaxLength(255)
                .HasColumnName("refresh_token");
            entity.Property(e => e.Salt)
                .HasColumnType("blob")
                .HasColumnName("salt");
            entity.Property(e => e.SecondName)
                .HasMaxLength(45)
                .HasColumnName("second_name");

            entity.HasMany(d => d.Hotels).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserHasHotel",
                    r => r.HasOne<Hotel>().WithMany()
                        .HasForeignKey("HotelId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_user_has_hotel_hotel1"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("fk_user_has_hotel_user"),
                    j =>
                    {
                        j.HasKey("UserId", "HotelId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("user_has_hotel");
                        j.HasIndex(new[] { "HotelId" }, "fk_user_has_hotel_hotel1_idx");
                        j.HasIndex(new[] { "UserId" }, "fk_user_has_hotel_user_idx");
                        j.IndexerProperty<int>("UserId")
                            .HasColumnType("int(11)")
                            .HasColumnName("user_id");
                        j.IndexerProperty<int>("HotelId")
                            .HasColumnType("int(11)")
                            .HasColumnName("hotel_id");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
