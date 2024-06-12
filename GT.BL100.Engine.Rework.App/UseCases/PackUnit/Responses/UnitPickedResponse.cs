namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public sealed record UnitPickedResponse(string message, DateTime DateTime)
        : SuccessPackUnitResponse(message, DateTime);
}
