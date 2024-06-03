using Common.Common.CleanArch;
using GT.BL100.Engine.Rework.App.UseCases.PackUnit;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GT.BL100.Engine.Rework.WebApi.Endpoints
{
    [ApiController]
    [Route("[controller]")]
    public class PackUnitController : ControllerBase
    {
        private readonly ILogger<PackUnitController> _logger;

        private readonly IMediator _mediator;

        private readonly GenericViewModel<PackUnitController> _viewModel;

        public PackUnitController(ILogger<PackUnitController> logger, IMediator mediator, GenericViewModel<PackUnitController> viewModel)
        {
            _logger = logger;
            _mediator = mediator;
            _viewModel = viewModel;
        }

        [HttpPost]
        [Route("/api/lines/bl100enginerework")]
        public async Task<IActionResult> Execute([FromBody] PackUnitRequestBody requestBody)
        {
            if (!PackUnitRequest.CanCreate(requestBody.ScannerInput, requestBody.Bearing_Position, requestBody.Arrow_Position, requestBody.Hipot_IR, requestBody.Cw_Speed, requestBody.Amperage_CW, requestBody.Ccw_Speed, requestBody.Amperage_CCW, requestBody.Ptc_Resistance, out var errors))
            {
                return StatusCode(400, _viewModel.Fail(errors.ToString()));
            }

            var request = PackUnitRequest.Create(requestBody.ScannerInput, requestBody.Bearing_Position, requestBody.Arrow_Position, requestBody.Hipot_IR, requestBody.Cw_Speed, requestBody.Amperage_CW, requestBody.Ccw_Speed, requestBody.Amperage_CCW, requestBody.Ptc_Resistance);
            try
            {
                _ = await _mediator.Send(request).ConfigureAwait(false);
                return _viewModel.IsSuccess ? Ok(_viewModel) : StatusCode(500, _viewModel);
            }
            catch (Exception ex)
            {
                var innerEx = ex;
                while (innerEx.InnerException != null) innerEx = innerEx.InnerException!;
                return StatusCode(500, _viewModel.Fail(innerEx.Message));
            }
        }
    }
}
