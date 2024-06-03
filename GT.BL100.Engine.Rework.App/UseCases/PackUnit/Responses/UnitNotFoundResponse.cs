namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public sealed record UnitNotFoundResponse(long UnitID) : FailurePackUnitResponse($"Pieza #{UnitID} no encontrada.");
}
