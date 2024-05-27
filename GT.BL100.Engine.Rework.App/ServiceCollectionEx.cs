using MediatR;
using Common.Common.CleanArch;
using Microsoft.Extensions.DependencyInjection;

namespace GT.BL100.Engine.Rework.App
{
    public static class ServiceCollectionEx
    {
        public static IServiceCollection AddAppServices(this IServiceCollection services)
        {
            return services
                .AddTransient(typeof(IPipelineBehavior<,>), typeof(InteractorPipeline<,>))
                .AddMediatR(cfg => { cfg.RegisterServicesFromAssembly(typeof(ServiceCollectionEx).Assembly); });
        }
    }
}
