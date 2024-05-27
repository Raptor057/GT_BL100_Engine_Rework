using GT.BL100.Engine.Rework.Domain.Entities;

namespace GT.BL100.Engine.Rework.App.Services
{
    public interface ILabelParserService
    {
        bool TryParseEZMotorsFormat(string value, out EZ2000MotorsQR? labelData);
    }
}
