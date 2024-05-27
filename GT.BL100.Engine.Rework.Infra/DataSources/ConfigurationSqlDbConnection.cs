namespace GT.BL100.Engine.Rework.Infra.DataSources
{
    public class ConfigurationSqlDbConnection<T> : DapperSqlDbConnection
    {
        public ConfigurationSqlDbConnection(ConfigurationSqlDbConnectionFactory<T> factory)
        : base(factory)
            { }
    }
}
