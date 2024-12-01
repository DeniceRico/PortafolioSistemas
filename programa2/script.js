let procesos = [];
let lotes = [];
let loteEnEjecucion = [];
let procesoActual = null;
let contadorGlobal = 0;
let intervaloGlobal;
let intervaloProceso;
let idContador = 1;
let isPaused = false;

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "p") {
    pausar();
  } else if (event.key.toLowerCase() === "c") {
    continuar();
  }
});

/*function pausar() {
  if (!isPaused) {
    clearInterval(intervaloGlobal);
    clearInterval(intervaloProceso);
    isPaused = true;
    alert("La ejecucion de los procesos se pauso.");
  }
}

function continuar() {
  if (isPaused) {
    isPaused = false;
    intervaloGlobal = setInterval(() => {
      contadorGlobal++;
      document.getElementById("contadorGlobal").textContent = contadorGlobal;
    }, 1000);

    ejecutarProceso(true); // pasa true para indicar que es una reanudación
    alert("La ejecucion continua");
  }
}*/

function pausar() {
  if (!isPaused) {
    clearInterval(intervaloGlobal);
    clearInterval(intervaloProceso); // Pausa el proceso en ejecución
    isPaused = true;
    alert("La ejecucion de los procesos se pauso.");
  }
}

function continuar() {
  if (isPaused) {
    isPaused = false;

    // Reanudar el contador global
    intervaloGlobal = setInterval(() => {
      contadorGlobal++;
      document.getElementById("contadorGlobal").textContent = contadorGlobal;
    }, 1000);

    // Reanudar el proceso en ejecución
    if (procesoActual) {
      intervaloProceso = setInterval(() => {
        if (procesoActual.tiempoRestante > 0) {
          procesoActual.tiempoRestante--;
          updateProcesoInfo();
        } else {
          clearInterval(intervaloProceso);
          procesarResultado();
          if (loteEnEjecucion.length > 0) {
            ejecutarProceso();
          } else {
            const liSeparador = document.createElement("li");
            liSeparador.textContent = "----------------------------";
            liSeparador.style.listStyleType = "none";
            document
              .getElementById("procesosTerminados")
              .appendChild(liSeparador);
            ejecutar();
          }
        }
      }, 1000);
    }
    alert("La ejecucion continua");
  }
}


function Procesos() {
  const numProcesos = parseInt(document.getElementById("numElm").value, 10);


  const operaciones = ["suma", "resta", "multiplicacion", "division", "modulo"];

  for (let i = 0; i < numProcesos; i++) {
    const tiempo = Math.floor(Math.random() * 15) + 1;
    const numero1 = Math.floor(Math.random() * 99) + 1;
    const numero2 = Math.floor(Math.random() * 99) + 1;
    const operacion =
      operaciones[Math.floor(Math.random() * operaciones.length)];

    const nuevoProceso = {
      id: idContador++,
      numero1,
      numero2,
      operacion,
      tiempo, // usar tiempo original aquí
      tiempoRestante: tiempo, // iniciar también el tiempo restante
    };

    procesos.push(nuevoProceso);
  }

  actualizarLotes();
}

function actualizarLotes() {
  while (procesos.length > 0) {
    lotes.push(procesos.splice(0, 5));
  }
  document.getElementById("lotesPendientes").textContent = lotes.length;
}

function Iniciar() {
  contadorGlobal = 0;
  intervaloGlobal = setInterval(() => {
    contadorGlobal++;
    document.getElementById("contadorGlobal").textContent = contadorGlobal;
  }, 1000);
  ejecutar();
}

/*function ejecutar() {
  if (lotes.length > 0) {
    loteEnEjecucion = lotes.shift();
    mostrarLote();
    ejecutarProceso();
  } else {
    finalizarEjecucion();
    const liSeparador = document.createElement("li");
    liSeparador.textContent = "----------------------------";
    liSeparador.style.listStyleType = "none"; // para que no tenga viñeta
    document.getElementById("procesosTerminados").appendChild(liSeparador);
  }
}*/

function ejecutar() {
  if (lotes.length > 0) {
    loteEnEjecucion = lotes.shift();
    mostrarLote();
    ejecutarProceso();
  } else {
    finalizarEjecucion();
    // Verifica si ya se añadió la línea separadora
    const procesosTerminadosList = document.getElementById("procesosTerminados");
    const existeSeparador = Array.from(procesosTerminadosList.children).some(li =>
      li.textContent.includes("----------------------------")
    );

    if (!existeSeparador) {
      const liSeparador = document.createElement("li");
      liSeparador.textContent = "----------------------------";
      liSeparador.style.listStyleType = "none"; // para que no tenga viñeta
      procesosTerminadosList.appendChild(liSeparador);
    }
  }
}


function mostrarLote() {
  const loteEnEjecucionList = document.getElementById("loteEnEjecucion");
  loteEnEjecucionList.innerHTML = "";

  loteEnEjecucion.forEach((proceso) => {
    const li = document.createElement("li");
    li.textContent = `ID: ${proceso.id} - ${proceso.tiempoRestante} segundos`;
    loteEnEjecucionList.appendChild(li);
  });

  document.getElementById("lotesPendientes").textContent = lotes.length;
}

function handleInterruption(event) {
  if (event.key === "i") {
    document.removeEventListener("keydown", handleInterruption);
    const procesoClonado = {
      ...procesoActual,
      tiempoRestante: procesoActual.tiempoRestante,
    };
    loteEnEjecucion.push(procesoClonado);
    mostrarLote();
    ejecutarProceso();
  }
}

function handleError(event) {
  if (event.key === "e") {
    document.removeEventListener("keydown", handleError);
    procesoError();
  }
}

/*function ejecutarProceso(isReanudacion = false) {
  if (!isReanudacion && loteEnEjecucion.length > 0) {
    procesoActual = loteEnEjecucion.shift();
  }

  if (procesoActual) {
    const updateProcesoInfo = () => {
      document.getElementById("procesoEnEjecucion").innerHTML = `
          <li>ID: ${procesoActual.id}</li>
          <li>Operacion: ${procesoActual.operacion}</li>
          <li>Operandos: ${procesoActual.numero1}, ${procesoActual.numero2}</li>
          <li>Tiempo Maximo Estimado: ${procesoActual.tiempoRestante} segundos</li>
          <li>ID: ${procesoActual.id}</li>
        `;
    };

    updateProcesoInfo();

    document.addEventListener("keydown", handleInterruption);
    document.addEventListener("keydown", handleError);

    intervaloProceso = setInterval(() => {
      if (procesoActual.tiempoRestante > 0) {
        procesoActual.tiempoRestante--;
        updateProcesoInfo();
      } else {
        clearInterval(intervaloProceso);
        procesarResultado();

        document.removeEventListener("keydown", handleInterruption);
        document.removeEventListener("keydown", handleError);

        if (loteEnEjecucion.length > 0) {
          ejecutarProceso();
        } else {
          const liSeparador = document.createElement("li");
          liSeparador.textContent = "----------------------------";
          liSeparador.style.listStyleType = "none";
          document
            .getElementById("procesosTerminados")
            .appendChild(liSeparador);
          ejecutar();
        }
      }

      if (!isPaused) {
        contadorGlobal++;
        document.getElementById("contadorGlobal").textContent = contadorGlobal;
      }
    }, 1000);
  } else {
    finalizarEjecucion();
  }
}*/

function ejecutarProceso(isReanudacion = false) {
  if (!isReanudacion && loteEnEjecucion.length > 0) {
    procesoActual = loteEnEjecucion.shift();
  }

  if (procesoActual) {
    updateProcesoInfo();

    document.addEventListener("keydown", handleInterruption);
    document.addEventListener("keydown", handleError);

    intervaloProceso = setInterval(() => {
      if (procesoActual.tiempoRestante > 0) {
        procesoActual.tiempoRestante--;
        updateProcesoInfo();
      } else {
        clearInterval(intervaloProceso);
        procesarResultado();

        document.removeEventListener("keydown", handleInterruption);
        document.removeEventListener("keydown", handleError);

        if (loteEnEjecucion.length > 0) {
          ejecutarProceso();
        } else {
          const liSeparador = document.createElement("li");
          liSeparador.textContent = "----------------------------";
          liSeparador.style.listStyleType = "none";
          document
            .getElementById("procesosTerminados")
            .appendChild(liSeparador);
          ejecutar();
        }
      }

      if (!isPaused) {
        contadorGlobal++;
        document.getElementById("contadorGlobal").textContent = contadorGlobal;
      }
    }, 1000);
  } else {
    finalizarEjecucion();
  }
}

function updateProcesoInfo() {
  document.getElementById("procesoEnEjecucion").innerHTML = `
    <li>ID: ${procesoActual.id}</li>
    <li>Operacion: ${procesoActual.operacion}</li>
    <li>Operandos: ${procesoActual.numero1}, ${procesoActual.numero2}</li>
    <li>Tiempo Maximo Estimado: ${procesoActual.tiempoRestante} segundos</li>
    <li>ID: ${procesoActual.id}</li>
  `;
}

function procesoError() {
  const li = document.createElement("li");
  li.textContent = `Programa ${procesoActual.id}: terminado con error`;
  document.getElementById("procesosTerminados").appendChild(li);

  procesoActual = null;

  if (loteEnEjecucion.length > 0) {
    ejecutarProceso();
  } else {
    ejecutar();
  }
}

/*function finalizarEjecucion() {
  alert("Todos los lotes han sido ejecutados.");
  clearInterval(intervaloGlobal);
  const liFinal = document.createElement("li");
  liFinal.textContent = "----------------------------";
  liFinal.style.listStyleType = "none";
  document.getElementById("procesosTerminados").appendChild(liFinal);
}*/

function finalizarEjecucion() {
  clearInterval(intervaloGlobal);
  alert("Todos los lotes han sido ejecutados.");

  const procesosTerminadosList = document.getElementById("procesosTerminados");
  const existeSeparador = Array.from(procesosTerminadosList.children).some(li =>
    li.textContent.includes("----------------------------")
  );

  // Añadir el separador si no existe
  if (!existeSeparador) {
    const liFinal = document.createElement("li");
    liFinal.textContent = "----------------------------";
    liFinal.style.listStyleType = "none";
    procesosTerminadosList.appendChild(liFinal);
  }
}

function procesarResultado() {
  let op = "";

  switch (procesoActual.operacion) {
    case "suma":
      op = "+";
      break;
    case "resta":
      op = "-";
      break;
    case "multiplicacion":
      op = "*";
      break;
    case "division":
      op = "/";
      break;
    case "modulo":
      op = "%";
      break;
  }

  const resultado = Operacion(
    procesoActual.operacion,
    procesoActual.numero1,
    procesoActual.numero2
  );

  const procesosTerminadosList = document.getElementById("procesosTerminados");
  const existeProceso = Array.from(procesosTerminadosList.children).some((li) =>
    li.textContent.includes(`Programa ${procesoActual.id}:`)
  );

  if (!existeProceso) {
    const li = document.createElement("li");
    li.textContent = `Programa ${procesoActual.id}: ${procesoActual.numero1} ${op} ${procesoActual.numero2} = ${resultado}`;
    procesosTerminadosList.appendChild(li);
  }
}

function Operacion(operacion, numero1, numero2) {
  switch (operacion) {
    case "suma":
      return numero1 + numero2;
    case "resta":
      return numero1 - numero2;
    case "multiplicacion":
      return numero1 * numero2;
    case "division":
      return numero2 === 0
        ? alert("No se puede dividir por cero")
        : numero1 / numero2;
    case "modulo":
      return numero2 === 0
        ? alert("No se puede dividir por cero")
        : numero1 % numero2;
  }
}
