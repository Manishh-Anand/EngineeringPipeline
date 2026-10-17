using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace Sample.Api.Auth;

public sealed class ApiKeyOptions
{
    public const string Section = "Auth";

    /// <summary>Shared key callers send in the X-Api-Key header. Supplied via env/user-secrets (Auth__ApiKey), never committed.</summary>
    public string? ApiKey { get; set; }
}

/// <summary>Authenticates requests carrying a valid X-Api-Key header.</summary>
public sealed class ApiKeyAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IOptions<ApiKeyOptions> apiKeyOptions)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "ApiKey";
    public const string HeaderName = "X-Api-Key";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var expected = apiKeyOptions.Value.ApiKey;
        if (string.IsNullOrEmpty(expected))
        {
            // Fail closed: an unconfigured key must never mean "allow everyone".
            Logger.LogError("Auth:ApiKey is not configured; rejecting request");
            return Task.FromResult(AuthenticateResult.Fail("API key not configured"));
        }

        if (!Request.Headers.TryGetValue(HeaderName, out var provided) || provided.Count != 1)
            return Task.FromResult(AuthenticateResult.NoResult());

        if (!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(provided[0]!), Encoding.UTF8.GetBytes(expected)))
            return Task.FromResult(AuthenticateResult.Fail("Invalid API key"));

        var identity = new ClaimsIdentity([new Claim(ClaimTypes.Name, "api-client")], SchemeName);
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName)));
    }
}
