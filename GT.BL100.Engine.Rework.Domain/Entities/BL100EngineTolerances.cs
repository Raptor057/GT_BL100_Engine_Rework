namespace GT.BL100.Engine.Rework.Domain.Entities
{
    public record BL100EngineDataInput(double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance, int pass);
}
