using Sample.Api.Services;

namespace Sample.Api.Endpoints;

public static class ApplicationEndpoints
{
    public static IEndpointRouteBuilder MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/applications").RequireAuthorization();

        group.MapGet("/", async (string? search, ApplicationService service, CancellationToken ct) =>
            Results.Ok(await service.ListAsync(search, ct)));

        group.MapGet("/{id:int}", async (int id, ApplicationService service, CancellationToken ct) =>
            await service.GetAsync(id, ct) is { } dto ? Results.Ok(dto) : Results.NotFound());

        return app;
    }
}
