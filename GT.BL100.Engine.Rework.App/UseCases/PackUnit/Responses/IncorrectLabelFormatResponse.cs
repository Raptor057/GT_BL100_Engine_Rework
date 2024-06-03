namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses
{
    public sealed record IncorrectLabelFormatResponse(string? Input) : FailurePackUnitResponse($"Formato de etiqueta equivocado \"{Input}\".");
}
