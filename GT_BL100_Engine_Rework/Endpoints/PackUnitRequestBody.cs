namespace GT.BL100.Engine.Rework.WebApi.Endpoints
{
    public class PackUnitRequestBody
    {
        public string? ScannerInput { get; set; }
        public double Bearing_Position { get; set; }
        public double Arrow_Position { get; set; }
        public double Hipot_IR { get; set; }
        public int Cw_Speed { get; set; }
        public double Amperage_CW { get; set; }
        public int Ccw_Speed { get; set; }
        public double Amperage_CCW { get; set; }
        public int Ptc_Resistance { get; set; }
    }

}
