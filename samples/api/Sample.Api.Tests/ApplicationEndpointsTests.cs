using System.Net;
using System.Net.Http.Json;
using Sample.Api.Contracts;

namespace Sample.Api.Tests;

public class ApplicationEndpointsTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task List_returns_seeded_applications_ordered_by_name()
    {
        var apps = await factory.CreateAuthorizedClient().GetFromJsonAsync<List<ApplicationDto>>("/api/applications");

        Assert.Equal(["HR Portal", "Intranet Wiki", "Payments Gateway"], apps!.Select(a => a.Name));
    }

    [Fact]
    public async Task List_filters_by_search_term()
    {
        var apps = await factory.CreateAuthorizedClient().GetFromJsonAsync<List<ApplicationDto>>("/api/applications?search=Portal");

        Assert.Equal("HR Portal", Assert.Single(apps!).Name);
    }

    [Fact]
    public async Task Get_returns_404_when_application_missing()
    {
        var response = await factory.CreateAuthorizedClient().GetAsync("/api/applications/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("wrong-key")]
    public async Task Requests_without_valid_api_key_are_rejected(string? key)
    {
        var client = factory.CreateClient();
        if (key is not null) client.DefaultRequestHeaders.Add("X-Api-Key", key);

        var response = await client.GetAsync("/api/applications");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
