namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public record UnitPackedResponse(string serialNumber, DateTime MotorDateTime, DateTime DateTime)
       : SuccessPackUnitResponse(serialNumber,MotorDateTime,DateTime);
}
