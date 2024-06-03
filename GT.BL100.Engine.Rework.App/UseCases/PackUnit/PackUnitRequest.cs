using Common.Common;
using Common.Common.CleanArch;
using GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses;


namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit
{
    public sealed class PackUnitRequest : IRequest<PackUnitResponse>
    {
        public static bool CanCreate(string? scannerInput,double bearing_Position,double arrow_Position, double hipot_IR,int cw_Speed,double amperage_CW,int ccw_Speed,double amperage_CCW,int ptc_Resistance, out ErrorList errors)
        {

            errors = new();
            if (string.IsNullOrEmpty(scannerInput))
            {
                errors.Add("La lectura se encuentra en blanco y es requerida.");
            }
            if (string.IsNullOrEmpty(bearing_Position.ToString()))
            {
                errors.Add("La lectura de Posicion de balero se encuentra en blanco y es requerida.");
            }
            if (string.IsNullOrEmpty(arrow_Position.ToString()))
            {
                errors.Add("La lectura de Posicion de flecha se encuentra en blanco y es requerida.");
            }
            if (string.IsNullOrEmpty(hipot_IR.ToString()))
            {
                errors.Add("La lectura de Hipot-IR se encuentra en blanco y es requerida.");
            }
            if (string.IsNullOrEmpty(cw_Speed.ToString()))
            {
                errors.Add("La lectura de Velocidad CW se encuentra en blanco y es requerida.");
            }
            if (string.IsNullOrEmpty(amperage_CW.ToString()))
            {
                errors.Add("La lectura de Amperaje CW se encuentra en blanco y es requerida.");
            }
            if (string.IsNullOrEmpty(ccw_Speed.ToString()))
            {
                errors.Add("La lectura de Velocidad CCW se encuentra en blanco y es requerida.");
            }
            if (string.IsNullOrEmpty(amperage_CCW.ToString()))
            {
                errors.Add("La lectura de Amperaje CCW se encuentra en blanco y es requerida.");
            }
            if (string.IsNullOrEmpty(ptc_Resistance.ToString()))
            {
                errors.Add("La lectura de Resistencia de PTC se encuentra en blanco y es requerida.");
            }
            return errors.IsEmpty;
        }

        public static PackUnitRequest Create(string? scannerInput, double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance)
        {
            if (!CanCreate(scannerInput,bearing_Position,arrow_Position,hipot_IR,cw_Speed,amperage_CW,ccw_Speed,amperage_CCW,ptc_Resistance, out var errors)) throw errors.AsException();
            return new(scannerInput!, bearing_Position, arrow_Position, hipot_IR, cw_Speed, amperage_CW, ccw_Speed, amperage_CCW, ptc_Resistance);
        }

        private PackUnitRequest(string scannerInput, double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance)
        {
            ScannerInput = scannerInput;
            Bearing_Position = bearing_Position;
            Arrow_Position  = arrow_Position;
            Hipot_IR = hipot_IR;
            Cw_Speed = cw_Speed;
            Amperage_CW = amperage_CW;
            Ccw_Speed = ccw_Speed;
            Amperage_CCW = amperage_CCW;
            Ptc_Resistance = ptc_Resistance;
        }

        public string? ScannerInput { get; }
        public double Bearing_Position { get; }
        public double Arrow_Position { get; }
        public double Hipot_IR { get; }
        public int Cw_Speed { get; }
        public double Amperage_CW { get; }
        public int Ccw_Speed { get; }
        public double Amperage_CCW { get; }
        public int Ptc_Resistance { get; }
    }
}
