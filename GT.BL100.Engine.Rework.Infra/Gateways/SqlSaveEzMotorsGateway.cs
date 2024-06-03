using GT.BL100.Engine.Rework.App.UseCases.PackUnit;
using GT.BL100.Engine.Rework.Infra.DataSources;

namespace GT.BL100.Engine.Rework.Infra.Gateways
{
    internal class SqlSaveEzMotorsGateway : ISaveEzMotorsGateway
    {
        private readonly GttSqlDB _gtt;

        public SqlSaveEzMotorsGateway(GttSqlDB gtt) 
        {
            _gtt=gtt;
        }


        public async Task AddEZMotorsDataAsync(string model, string serialNumber, string Volt, string RPM, DateTime DateTimeMotor, string Rev, string lineCode, int re_work, double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance)
            => await _gtt.AddEZMotorsData(model,serialNumber,Volt,RPM,DateTimeMotor,Rev,lineCode,re_work,bearing_Position,arrow_Position,hipot_IR,cw_Speed,amperage_CW,ccw_Speed,amperage_CCW,ptc_Resistance).ConfigureAwait(false);

        public async Task<bool> GetEzMotorsDataAsync(string serialNumber, DateTime dateTimeMotor)
            => await _gtt.GetEzMotorsData(serialNumber, dateTimeMotor).ConfigureAwait(false) > 1;
    }
}
