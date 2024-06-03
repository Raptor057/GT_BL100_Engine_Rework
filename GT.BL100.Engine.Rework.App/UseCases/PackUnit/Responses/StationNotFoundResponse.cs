namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public sealed record ErrorMessage(string Message) : FailurePackUnitResponse($"{Message}");
}
