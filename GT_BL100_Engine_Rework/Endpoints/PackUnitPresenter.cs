using Common.Common.CleanArch;
using Common.Common;
using GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace GT.BL100.Engine.Rework.WebApi.Endpoints
{
    public sealed class PackUnitPresenter<T> : IPresenter<PackUnitResponse>
           where T : PackUnitResponse
    {
        private readonly GenericViewModel<PackUnitController> _viewModel;

        public PackUnitPresenter(GenericViewModel<PackUnitController> viewModel)
        {
            _viewModel = viewModel;
        }

        public async Task Handle(PackUnitResponse notification, CancellationToken cancellationToken)
        {
            if (notification is IFailure failure)
            {
                _viewModel.Fail(failure.Message);
            }
            if (notification is UnitPackedResponse unitPackedResponse)
            {
                _viewModel.OK(unitPackedResponse);
            }
        }
    }
}
