using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GT.BL100.Engine.Rework.Infra
{
    public static class ServiceCollectionEx
    {
        public static IServiceCollection AddInfraServices(this IServiceCollection services, IConfigurationRoot configuration)
        {
            return services;
                //.AddLoggingServices(configuration);
                //.AddSingleton(typeof(ConfigurationSqlDbConnectionFactory<>))
                //.AddSingleton(typeof(ConfigurationSqlDbConnection<>))
                //.AddSingleton<AppsSqlDB>()
                //.AddSingleton<TrazaSqlDB>()
                //.AddSingleton<CegidSqlDB>()
                //.AddSingleton<GttSqlDB>()
                //.AddSingleton<ILineHeadcountGateway, SqlLineHeadcountGateway>()
                //.AddSingleton<IJoinFramelessMotorsGateway, SqlJoinFramelessMotorsGateway>()//Se agrega esto para hacer Join de los motores en LP  RA: 06/22/2023
                //.AddSingleton<IJoinEZMotorsGateway, SqlJoinEZMotorsGateway>()//Se agrega esto para hacer Join de los motores en LP  RA: 06/27/2023
                //.AddSingleton<IJoinLinePalletGateway, SqlJoinPalletGateway>()// Se agrego esto para hacer Join entre las transmisiones y los pallet RA: 09/12/2023
                //.AddSingleton<ISaveEzMotorsGateway, SqlSaveEzMotorsGateway>()//Se agrego esto para registrar los motores de EZ en la linea E1 RA: 11/22/2023
                //.AddSingleton<IHourlyProductionGateway, SqlHourlyProductionGateway>()
                //.AddSingleton<IMasterLabelsGateway, SqlMasterLabelsGateway>()
                //.AddSingleton<IPrintingService, PrintingService>()
                //.AddSingleton<ILabelParserService, LabelParserService>()
                //.AddSingleton<INotificationsService, NotificationsService>()
                //.AddSingleton<IStationRepository, StationRepository>()
                //.AddSingleton<IUnitRepository, UnitRepository>()
                ////.AddSingleton<IStationsDao, StationsSqlDao>()
                //.AddSingleton<ISetStationBlockedGateway, SqlSetStationBlockedRepository>()
                //.AddSingleton<ILinesDao, LinesSqlDao>()
                //.AddSingleton<IUsersDao, UsersSqlDao>()
                //.AddSingleton<IUnpackUnitGateway, SqlUnpackUnitGateway>();
        }

    }
}
