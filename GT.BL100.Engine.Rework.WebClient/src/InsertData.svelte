<script>
    import { onMount } from "svelte";
    import Sfx from "./utils/Sfx";
    import { Bl100EngineRework } from "./utils/HttpRequests";


    let ScannerInput = "";
    let Bearing_Position;
    let Arrow_Position;
    let Hipot_IR;
    let Cw_Speed;
    let Amperage_CW;
    let Ccw_Speed;
    let Amperage_CCW;
    let Ptc_Resistance;
  
    let ScannerInputDisabled = false;
    let Bearing_PositionDisabled = false;
    let Arrow_PositionDisabled = false;
    let Hipot_IRDisabled = false;
    let Cw_SpeedDisabled = false;
    let Amperage_CWDisabled = false;
    let Ccw_SpeedDisabled = false;
    let Amperage_CCWDisabled = false;
    let Ptc_ResistanceDisabled = false;
    
    function handleSubmit() {
  console.log("Datos enviados:", {
    ScannerInput,
    Bearing_Position,
    Arrow_Position,
    Hipot_IR,
    Cw_Speed,
    Amperage_CW,
    Ccw_Speed,
    Amperage_CCW,
    Ptc_Resistance
  });

  Bl100EngineRework.InsertMotorData(
    ScannerInput,
    Bearing_Position,
    Arrow_Position,
    Hipot_IR,
    Cw_Speed,
    Amperage_CW,
    Ccw_Speed,
    Amperage_CCW,
    Ptc_Resistance
  )
    .then((response) => {
      if (response.isSuccess = true) {
        // Éxito: hacer algo con la respuesta
        //console.log("Éxito:", response.message);
        Sfx.playSuccessSoundAsync();
        // Mostrar una alerta al usuario
        alert("Motor registrado exitosamente.");
        // ...
      } 
      else if (response.isSuccess = false)
      {
        // Error: hacer algo con la respuesta
        //console.error("Error:", response.message);
        // Mostrar una alerta al usuario
        Sfx.playFailureSoundAsync();
        alert(`Error al registrar el motor ${response.message}. Vuelve a intentar.`);
        // ...
      }
    })
    .catch((error) => {
      Sfx.playFailureSoundAsync();
      console.error("Error en la solicitud:", error);
      // Manejar el error de la solicitud
      //alert("Error en la solicitud. Vuelve a intentar.");
      alert(`Error al registrar el motor [${error}]. Vuelve a intentar.`);
    })
    .finally(() => {
      // Restablecer los valores de las variables
      ScannerInput = "";
      Bearing_Position = null;
      Arrow_Position = null;
      Hipot_IR = null;
      Cw_Speed = null;
      Amperage_CW = null;
      Ccw_Speed = null;
      Amperage_CCW = null;
      Ptc_Resistance = null;

      // Desbloquear todos los campos
      ScannerInputDisabled = false;
      Bearing_PositionDisabled = false;
      Arrow_PositionDisabled = false;
      Hipot_IRDisabled = false;
      Cw_SpeedDisabled = false;
      Amperage_CWDisabled = false;
      Ccw_SpeedDisabled = false;
      Amperage_CCWDisabled = false;
      Ptc_ResistanceDisabled = false;
    });
}

function validateForm() {
  const requiredFields = [
    ScannerInput,
    Bearing_Position,
    Arrow_Position,
    Hipot_IR,
    Cw_Speed,
    Amperage_CW,
    Ccw_Speed,
    Amperage_CCW,
    Ptc_Resistance
  ];

  for (const field of requiredFields) {
    if (!field) {
      alert('Por favor, completa todos los campos antes de enviar.');
      return false;
    }
  }

  return true;
}



  </script>
  
  <h1>Captura de Datos De Retrabajo De Motor BL100</h1>
  <main>
    <form on:submit|preventDefault={() => validateForm()}>
      <label class="full-width">
        QR del Motor:
        <!-- <input type="text" bind:value={ScannerInput} on:blur={() => ScannerInputDisabled = true} disabled={ScannerInputDisabled} /> -->
        <input type="text" bind:value={ScannerInput} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}/>
      </label>
      <label>
        Posición del Balero:
        <input type="number" step="0.1" bind:value={Bearing_Position} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}/>
      </label>
      <label>
        Posición de la flecha:
        <input type="number" step="0.1" bind:value={Arrow_Position} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}/>
      </label>
      <label>
        Hipot IR:
        <input type="number" step="0.01" bind:value={Hipot_IR} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}/>
      </label>
      <label>
        Velocidad CW:
        <input type="number" step="1" bind:value={Cw_Speed} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}/>
      </label>
      <label>
        Amperaje CW:
        <input type="number" step="0.1" bind:value={Amperage_CW} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}/>
      </label>
      <label>
        Velocidad CCW:
        <input type="number" step="1" bind:value={Ccw_Speed} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}>
      </label>
      <label>
        Amperaje CCW:
        <input type="number" step="0.1" bind:value={Amperage_CCW} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}/>
      </label>
      <label>
        Resistencia de PTC:
        <input type="number" step="1" bind:value={Ptc_Resistance} on:keydown={(event) => event.key === 'Enter' && event.preventDefault()}/>
      </label>
      <!-- <button type="submit">Enviar</button> -->
      <button type="submit" on:click|preventDefault={() => handleSubmit()}>Enviar</button>
    </form>
  </main>
  
  <style>
    /* body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f4f4f4;
    } */
    /* main {
      max-width: 600px;
      margin: auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    } */

    h1 {
      text-align: center;
      margin-bottom: 20px;
    }
    form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    label {
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
    }
    label.full-width {
      grid-column: span 2;
      text-align: center;
    }
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-top: 5px;
    }
    button {
      grid-column: span 2;
      padding: 10px;
      background-color: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #218838;
    }
  </style>
  