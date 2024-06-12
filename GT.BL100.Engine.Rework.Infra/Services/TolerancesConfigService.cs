using GT.BL100.Engine.Rework.App.Services;
using GT.BL100.Engine.Rework.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GT.BL100.Engine.Rework.Infra.Services
{
    public sealed record TolerancesConfigService(ILogger<TolerancesConfigService> Logger, IConfigurationRoot Configuration) : ITolerancesConfigService
    {


        private const string BL100EngineTolerancesSection = "Tolerances";
        private const string BL100EngineTolerancesMax = "Max";
        private const string BL100EngineTolerancesMin = "Min";
        private const string BL100EngineTolerancesBearing_Position = "Bearing_Position";
        private const string BL100EngineTolerancesArrow_Position = "Arrow_Position";
        private const string BL100EngineTolerancesHipot_IR = "Hipot_IR";
        private const string BL100EngineTolerancesCw_Speed = "Cw_Speed";
        private const string BL100EngineTolerancesAmperage_CW = "Amperage_CW";
        private const string BL100EngineTolerancesCcw_Speed = "Ccw_Speed";
        private const string BL100EngineTolerancesAmperage_CCW = "Amperage_CCW";
        private const string BL100EngineTolerancesPtc_Resistance = "Ptc_Resistance";

        private static string BL100EngineTolerancesBearing_PositionMax => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesBearing_Position}:{BL100EngineTolerancesMax}";
        private static string BL100EngineTolerancesBearing_PositionMin => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesBearing_Position}:{BL100EngineTolerancesMin}";
        private static string BL100EngineTolerancesArrow_PositionMax => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesArrow_Position}:{BL100EngineTolerancesMax}";
        private static string BL100EngineTolerancesArrow_PositionMin => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesArrow_Position}:{BL100EngineTolerancesMin}";
        private static string BL100EngineTolerancesHipot_IRMax => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesHipot_IR}:{BL100EngineTolerancesMax}";
        private static string BL100EngineTolerancesHipot_IRMin => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesHipot_IR}:{BL100EngineTolerancesMin}";
        private static string BL100EngineTolerancesCw_SpeedMax => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesCw_Speed}:{BL100EngineTolerancesMax}";
        private static string BL100EngineTolerancesCw_SpeedMin => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesCw_Speed}:{BL100EngineTolerancesMin}";
        private static string BL100EngineTolerancesAmperage_CWMax => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesAmperage_CW}:{BL100EngineTolerancesMax}";
        private static string BL100EngineTolerancesAmperage_CWMin => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesAmperage_CW}:{BL100EngineTolerancesMin}";
        private static string BL100EngineTolerancesCcw_SpeedMax => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesCcw_Speed}:{BL100EngineTolerancesMax}";
        private static string BL100EngineTolerancesCcw_SpeedMin => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesCcw_Speed}:{BL100EngineTolerancesMin}";
        private static string BL100EngineTolerancesAmperage_CCWMax => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesAmperage_CCW}:{BL100EngineTolerancesMax}";
        private static string BL100EngineTolerancesAmperage_CCWMin => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesAmperage_CCW}:{BL100EngineTolerancesMin}";
        private static string BL100EngineTolerancesPtc_ResistanceMax => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesPtc_Resistance}:{BL100EngineTolerancesMax}";
        private static string BL100EngineTolerancesPtc_ResistanceMin => $"{BL100EngineTolerancesSection}:{BL100EngineTolerancesPtc_Resistance}:{BL100EngineTolerancesMin}";

        public bool BL100EngineTolerances(double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance, out BL100EngineDataInput? bL100EngineData)
        {
            double Bearing_PositionMax =  Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesBearing_PositionMax).Value);
            double Bearing_PositionMin = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesBearing_PositionMin).Value);
            double Arrow_PositionMax = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesArrow_PositionMax).Value);
            double Arrow_PositionMin = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesArrow_PositionMin).Value);
            double Hipot_IRMax = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesHipot_IRMax).Value);
            double Hipot_IRMin = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesHipot_IRMin).Value);
            int Cw_SpeedMax = Convert.ToInt32(Configuration.GetSection(BL100EngineTolerancesCw_SpeedMax).Value);
            int Cw_SpeedMin = Convert.ToInt32(Configuration.GetSection(BL100EngineTolerancesCw_SpeedMin).Value);
            double Amperage_CWMax = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesAmperage_CWMax).Value);
            double Amperage_CWMin = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesAmperage_CWMin).Value);
            int Ccw_SpeedMax = Convert.ToInt32(Configuration.GetSection(BL100EngineTolerancesCcw_SpeedMax).Value);
            int Ccw_SpeedMin = Convert.ToInt32(Configuration.GetSection(BL100EngineTolerancesCcw_SpeedMin).Value);
            double Amperage_CCWMax = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesAmperage_CCWMax).Value);
            double Amperage_CCWMin = Convert.ToDouble(Configuration.GetSection(BL100EngineTolerancesAmperage_CCWMin).Value);
            int Ptc_ResistanceMax = Convert.ToInt32(Configuration.GetSection(BL100EngineTolerancesPtc_ResistanceMax).Value);
            int Ptc_ResistanceMin = Convert.ToInt32(Configuration.GetSection(BL100EngineTolerancesPtc_ResistanceMin).Value);

            if (bearing_Position >= Bearing_PositionMin && bearing_Position <= Bearing_PositionMax
                && arrow_Position >= Arrow_PositionMin && arrow_Position <= Arrow_PositionMax
                && hipot_IR >= Hipot_IRMin && hipot_IR <= Hipot_IRMax
                && cw_Speed >= Cw_SpeedMin && cw_Speed <= Cw_SpeedMax
                && amperage_CW >= Amperage_CWMin && amperage_CW <= Amperage_CWMax
                && ccw_Speed >= Ccw_SpeedMin && ccw_Speed <= Ccw_SpeedMax
                && amperage_CCW >= Amperage_CCWMin && amperage_CCW <= Amperage_CCWMax
                && ptc_Resistance >= Ptc_ResistanceMin && ptc_Resistance <= Ptc_ResistanceMax)
            {
                bL100EngineData = new BL100EngineDataInput(
                    bearing_Position,
                    arrow_Position,
                    hipot_IR,
                    cw_Speed,
                    amperage_CW,
                    ccw_Speed,
                    amperage_CCW,
                    ptc_Resistance);
            }
            else
            {
                bL100EngineData = null;
            }

            return bL100EngineData != null;
        }
    }

}
