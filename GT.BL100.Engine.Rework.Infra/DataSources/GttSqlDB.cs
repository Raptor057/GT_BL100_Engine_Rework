namespace GT.BL100.Engine.Rework.Infra.DataSources
{
    public class GttSqlDB
    {
        private readonly DapperSqlDbConnection _con;

        public GttSqlDB(ConfigurationSqlDbConnection<GttSqlDB> con)
        {
            _con = con;
        }



    }
}
