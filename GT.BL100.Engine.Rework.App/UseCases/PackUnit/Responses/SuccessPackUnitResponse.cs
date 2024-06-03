namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public abstract record SuccessPackUnitResponse(string serialNumber, DateTime MotorDateTime, DateTime DateTime) : PackUnitResponse;
}
