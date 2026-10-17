namespace Sample.Api.Entities;

public enum RiskLevel
{
    Low,
    Medium,
    High,
    Critical,
}

public class Application
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Owner { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public DateTime LastAssessedUtc { get; set; }
}
