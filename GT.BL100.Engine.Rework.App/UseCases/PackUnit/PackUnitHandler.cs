using Common.Common.CleanArch;
using GT.BL100.Engine.Rework.App.Services;
using GT.BL100.Engine.Rework.App.UseCases.PackUnit.Responses;
//using GT.BL100.Engine.Rework.Domain.Repositories;
using MediatR;
using System.Globalization;

namespace GT.BL100.Engine.Rework.App.UseCases.PackUnit
{
    internal sealed class PackUnitHandler : IInteractor<PackUnitRequest, PackUnitResponse>
    {
        private readonly ILabelParserService _labelParser;
        //private readonly IUnitRepository _units;
        private readonly ITolerancesConfigService _tolerances;
        private readonly ISaveEzMotorsGateway _saveEzMotors;

        //public PackUnitHandler( ILabelParserService labelParser, IUnitRepository units, ITolerancesConfigService tolerances, ISaveEzMotorsGateway saveEzMotors)
        public PackUnitHandler(ILabelParserService labelParser,ITolerancesConfigService tolerances, ISaveEzMotorsGateway saveEzMotors)
        {
            _labelParser=labelParser;
            //_units=units;
            _tolerances=tolerances;
            _saveEzMotors=saveEzMotors;
        }

        public async Task<PackUnitResponse> Handle(PackUnitRequest request, CancellationToken cancellationToken)
        {
            long unitID;

            if (string.IsNullOrEmpty(request.ScannerInput) || string.IsNullOrWhiteSpace(request.ScannerInput))
                return new ErrorMessage("Sin datos de Motor");

            if (_labelParser.TryParseEZMotorsFormat(request.ScannerInput ?? "", out var labeldata) && labeldata != null)
            {
                string serialNumber = labeldata.Motor_number;
                // Convertir fecha y hora a objetos DateTime
                DateTime fecha = DateTime.ParseExact(labeldata.Date, "yyyy-MM-dd", null);
                DateTime hora = DateTime.ParseExact(labeldata.Time, "HH:mm", null);
                DateTime MotorDateTime = DateTime.ParseExact($"{labeldata.Date} {labeldata.Time}", "yyyy-M-d HH:mm", CultureInfo.InvariantCulture);
                // Combinar fecha y hora en un solo objeto DateTime
                DateTime creationTime = fecha.Add(hora.TimeOfDay);
                
                var GetMotorData = await _saveEzMotors.GetEzMotorsDataAsync(serialNumber,MotorDateTime).ConfigureAwait(false);

                if (!GetMotorData)
                {
                    if (_tolerances.BL100EngineTolerances(
                    request.Bearing_Position,
                    request.Arrow_Position,
                    request.Hipot_IR,
                    request.Cw_Speed,
                    request.Amperage_CCW,
                    request.Ccw_Speed,
                    request.Amperage_CCW,
                    request.Ptc_Resistance
                    , out var bL100EngineData) && bL100EngineData != null)
                    {
                        await _saveEzMotors.AddEZMotorsDataAsync("Rework", serialNumber,labeldata.No_Load_Current, labeldata.No_Load_Speed,MotorDateTime,labeldata.Rev,"N/A",1,
                            bL100EngineData.bearing_Position, bL100EngineData.arrow_Position, bL100EngineData.hipot_IR, bL100EngineData.cw_Speed, bL100EngineData.amperage_CCW,
                            bL100EngineData.ccw_Speed, bL100EngineData.amperage_CCW, bL100EngineData.ptc_Resistance).ConfigureAwait(false);
                        return new UnitPackedResponse(serialNumber,MotorDateTime,DateTime.Now);
                    }
                }
                else 
                {
                    return new ErrorMessage("Ya exsiste un motor registrado en este proceso");
                }
            }
            //return new UnitPackedResponse("OK", DateTime.Now, DateTime.Now);
            return new ErrorMessage("No se registro el motor debido a que esta fuera de tolerancia o el QR no es valido, vuelve a intentar");
            //throw new NotImplementedException();
        }
    }
}
