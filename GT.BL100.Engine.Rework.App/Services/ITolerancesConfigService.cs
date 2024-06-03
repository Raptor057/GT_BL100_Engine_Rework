using GT.BL100.Engine.Rework.Domain.Entities;

namespace GT.BL100.Engine.Rework.App.Services
{
    public interface ITolerancesConfigService
    {
        bool BL100EngineTolerances(double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance, out BL100EngineDataInput? bL100EngineData);
    }
}
