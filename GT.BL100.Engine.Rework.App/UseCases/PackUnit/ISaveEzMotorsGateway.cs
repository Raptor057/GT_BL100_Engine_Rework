namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit
{
    public interface ISaveEzMotorsGateway
    {
        Task AddEZMotorsDataAsync(string model, string serialNumber, string Volt, string RPM, DateTime DateTimeMotor, string Rev, string lineCode,int re_work, double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance);
        Task AddBadEZMotorsDataAsync(string model, string serialNumber, string Volt, string RPM, DateTime DateTimeMotor, string Rev, string lineCode, int re_work, double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance);
        Task<bool> GetEzMotorsDataAsync(string serialNumber,DateTime dateTimeMotor);
    }
}
