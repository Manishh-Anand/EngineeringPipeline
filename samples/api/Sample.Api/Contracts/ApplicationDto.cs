namespace Sample.Api.Contracts;

/// <summary>Public shape of an application. Additive changes only (see aspnet-core rule).</summary>
public record ApplicationDto(int Id, string Name, string Owner, string RiskLevel, DateTime LastAssessedUtc);
