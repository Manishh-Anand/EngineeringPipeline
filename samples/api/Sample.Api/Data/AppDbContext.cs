using Microsoft.EntityFrameworkCore;
using Sample.Api.Entities;

namespace Sample.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Application> Applications => Set<Application>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Application>(e =>
        {
            e.ToTable("Application", "dbo");
            e.Property(a => a.Name).HasMaxLength(200);
            e.Property(a => a.Owner).HasMaxLength(200);
            e.Property(a => a.RiskLevel).HasConversion<string>().HasMaxLength(16);
            e.HasIndex(a => a.Name).HasDatabaseName("IX_Application_Name");
            e.HasData(
                new Application { Id = 1, Name = "Payments Gateway", Owner = "Finance Platform", RiskLevel = RiskLevel.High, LastAssessedUtc = new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Application { Id = 2, Name = "HR Portal", Owner = "People Systems", RiskLevel = RiskLevel.Medium, LastAssessedUtc = new DateTime(2026, 8, 15, 0, 0, 0, DateTimeKind.Utc) },
                new Application { Id = 3, Name = "Intranet Wiki", Owner = "Workplace IT", RiskLevel = RiskLevel.Low, LastAssessedUtc = new DateTime(2026, 7, 20, 0, 0, 0, DateTimeKind.Utc) });
        });
    }
}
