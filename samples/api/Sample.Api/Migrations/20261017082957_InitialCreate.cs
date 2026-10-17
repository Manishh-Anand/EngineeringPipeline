using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Sample.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "Application",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Owner = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    LastAssessedUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Application", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "Application",
                columns: new[] { "Id", "LastAssessedUtc", "Name", "Owner", "RiskLevel" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Payments Gateway", "Finance Platform", "High" },
                    { 2, new DateTime(2026, 8, 15, 0, 0, 0, 0, DateTimeKind.Utc), "HR Portal", "People Systems", "Medium" },
                    { 3, new DateTime(2026, 7, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Intranet Wiki", "Workplace IT", "Low" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Application_Name",
                schema: "dbo",
                table: "Application",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Application",
                schema: "dbo");
        }
    }
}
