using Common.Common;

namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public abstract record FailurePackUnitResponse(string Message) : PackUnitResponse, IFailure;
}
