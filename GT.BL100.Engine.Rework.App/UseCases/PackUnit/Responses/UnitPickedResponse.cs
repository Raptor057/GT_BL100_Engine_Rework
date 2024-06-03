namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public sealed record UnitPickedResponse(string serialNumber, DateTime MotorDateTime, DateTime DateTime)
        : SuccessPackUnitResponse(serialNumber, MotorDateTime, DateTime);
}
