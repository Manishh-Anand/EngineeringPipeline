using Microsoft.EntityFrameworkCore;
using Sample.Api.Contracts;
using Sample.Api.Data;

namespace Sample.Api.Services;

public class ApplicationService(AppDbContext db)
{
    public async Task<IReadOnlyList<ApplicationDto>> ListAsync(string? search, CancellationToken ct)
    {
        var query = db.Applications.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.Name.Contains(search));

        return await query
            .OrderBy(a => a.Name)
            .Select(a => new ApplicationDto(a.Id, a.Name, a.Owner, a.RiskLevel.ToString(), a.LastAssessedUtc))
            .ToListAsync(ct);
    }

    public Task<ApplicationDto?> GetAsync(int id, CancellationToken ct) =>
        db.Applications.AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new ApplicationDto(a.Id, a.Name, a.Owner, a.RiskLevel.ToString(), a.LastAssessedUtc))
            .FirstOrDefaultAsync(ct);
}
