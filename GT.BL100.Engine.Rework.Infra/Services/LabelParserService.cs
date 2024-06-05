using GT.BL100.Engine.Rework.App.Services;
using GT.BL100.Engine.Rework.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace GT.BL100.Engine.Rework.Infra.Services
{
    public sealed record LabelParserService(ILogger<LabelParserService> Logger, IConfigurationRoot Configuration) : ILabelParserService
    {
        private const string LabelFormatRegExPatternsSectionName = "LabelFormatRegExPatterns";
        private const string EZMotorsLabelFormatRegExPatternName = "EZ2000MotorsQR";
        public const string InformationSeparatorThree = "\u001d";
        public const string EndOfTransmission = "\u0004";
        private static string EZMotorsLabelFormatRegExPattern => $"{LabelFormatRegExPatternsSectionName}:{EZMotorsLabelFormatRegExPatternName}";
        private static string ClearInputFromSpecialCharacters(string input) => input.Replace(InformationSeparatorThree, "").Replace(EndOfTransmission, "");

        public bool TryParseEZMotorsFormat(string value, out EZ2000MotorsQR? labelData)
        {
            var match = Regex.Match(
                ClearInputFromSpecialCharacters(value),
                Configuration.GetSection(EZMotorsLabelFormatRegExPattern).Value ?? "",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);

            if (match.Success)
            {
                string rawDate = match.Groups["date"].Value;
                //string formattedDate = rawDate.Replace("/", "-"); // Convierte el formato de fecha
                string formattedDate = rawDate.Replace(" ", "-").Replace("/", "-"); // Reemplaza espacios y barras diagonales
                labelData = new EZ2000MotorsQR(
                match.Groups["website"].Value,
                match.Groups["voltage"].Value,
                match.Groups["rpm"].Value,
                //match.Groups["date"].Value,
                formattedDate, // Usa la fecha convertida
                match.Groups["time"].Value,
                match.Groups["id"].Value,
                match.Groups["PN"].Value,
                match.Groups["AEM"].Value,
                ""//Reservado para la Rev
                );
            }
            else
            {
                labelData = null;
            }
            return labelData != null;
        }
    }
}
