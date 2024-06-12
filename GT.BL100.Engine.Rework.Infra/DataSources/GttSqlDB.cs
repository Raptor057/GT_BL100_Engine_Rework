using System.Reflection;

namespace GT.BL100.Engine.Rework.Infra.DataSources
{
    public class GttSqlDB
    {
        private readonly DapperSqlDbConnection _con;

        public GttSqlDB(ConfigurationSqlDbConnection<GttSqlDB> con)
        {
            _con = con;
        }

        public async Task AddEZMotorsData(string model, string serialNumber, string Volt, string RPM, DateTime DateTimeMotor, string Rev, string lineCode, 
            int re_work, double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance,int Pass)
        {
            await _con.ExecuteAsync("INSERT INTO [gtt].[dbo].[MotorsData] ([Modelo], [SerialNumber], [Volt], [RPM], [DateTimeMotor], [Rev], [LineCode], " +
                "[re_work], [Bearing_Position], [Arrow_Position], [Hipot_IR], [CW_Speed], [Amperage_CW], [CCW_Speed], [Amperage_CCW], [PTC_Resistance],[Pass]) " +
                "VALUES(@model, @serialNumber, @Volt, @RPM, @DateTimeMotor, @Rev, @lineCode, @re_work, @bearing_Position, @arrow_Position, @hipot_IR, @cw_Speed, @amperage_CW, @ccw_Speed, @amperage_CCW, @ptc_Resistance,@Pass)",
            new {model,serialNumber,Volt,RPM,DateTimeMotor,Rev,lineCode,re_work,bearing_Position,arrow_Position,hipot_IR,cw_Speed,amperage_CW,ccw_Speed,amperage_CCW,ptc_Resistance, Pass }).ConfigureAwait(false);
        }
        public async Task AddBadEZMotorsData(string model, string serialNumber, string Volt, string RPM, DateTime DateTimeMotor, string Rev, string lineCode,
            int re_work, double bearing_Position, double arrow_Position, double hipot_IR, int cw_Speed, double amperage_CW, int ccw_Speed, double amperage_CCW, int ptc_Resistance, int Pass)
        {
            await _con.ExecuteAsync("INSERT INTO [gtt].[dbo].[MotorsData] ([Modelo], [SerialNumber], [Volt], [RPM], [DateTimeMotor], [Rev], [LineCode], " +
                "[re_work], [Bearing_Position], [Arrow_Position], [Hipot_IR], [CW_Speed], [Amperage_CW], [CCW_Speed], [Amperage_CCW], [PTC_Resistance],[Pass]) " +
                "VALUES(@model, @serialNumber, @Volt, @RPM, @DateTimeMotor, @Rev, @lineCode, @re_work, @bearing_Position, @arrow_Position, @hipot_IR, @cw_Speed, @amperage_CW, @ccw_Speed, @amperage_CCW, @ptc_Resistance,@Pass)",
            new { model, serialNumber, Volt, RPM, DateTimeMotor, Rev, lineCode, re_work, bearing_Position, arrow_Position, hipot_IR, cw_Speed, amperage_CW, ccw_Speed, amperage_CCW, ptc_Resistance ,Pass }).ConfigureAwait(false);
        }
        public async Task<int> GetEzMotorsData(string serialNumber, DateTime dateTimeMotor)
        {
            return await _con.QuerySingleAsync<int>("SELECT COUNT(ID) FROM [gtt].[dbo].[MotorsData] WHERE SerialNumber = @serialNumber AND DateTimeMotor = @dateTimeMotor AND re_work = 1 AND IsActive = 1", new {serialNumber, dateTimeMotor });
        }
    }
}
