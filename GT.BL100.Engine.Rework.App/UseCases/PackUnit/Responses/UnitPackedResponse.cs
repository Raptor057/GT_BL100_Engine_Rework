namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public record UnitPackedResponse(string message, DateTime DateTime)
       : SuccessPackUnitResponse(message,DateTime);
}
