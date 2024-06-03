using Common.Common;

namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public sealed record InvalidLabelResponse(ErrorList Errors) : FailurePackUnitResponse(Errors.ToString());
}
