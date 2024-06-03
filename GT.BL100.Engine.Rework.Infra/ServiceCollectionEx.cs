using Common.Common.Logging;
using GT.BL100.Engine.Rework.App.Services;
using GT.BL100.Engine.Rework.App.UseCases.PackUnit;
using GT.BL100.Engine.Rework.Infra.DataSources;
using GT.BL100.Engine.Rework.Infra.Gateways;
using GT.BL100.Engine.Rework.Infra.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GT.BL100.Engine.Rework.Infra
{
    public static class ServiceCollectionEx
    {
        public static IServiceCollection AddInfraServices(this IServiceCollection services, IConfigurationRoot configuration)
        {
            return services
                .AddLoggingServices(configuration)
                .AddSingleton(typeof(ConfigurationSqlDbConnectionFactory<>))
                .AddSingleton(typeof(ConfigurationSqlDbConnection<>))
                .AddSingleton<GttSqlDB>()
                .AddSingleton<ILabelParserService, LabelParserService>()
                .AddSingleton<ITolerancesConfigService, TolerancesConfigService>()
                .AddSingleton<ISaveEzMotorsGateway, SqlSaveEzMotorsGateway>();
        }

    }
}
