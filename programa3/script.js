let procesos = [];
let lotes = [];
let loteEnEjecucion = [];
let procesoBloqueado = [];
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
  } else if (event.key.toLowerCase() === "i") {
    bloquearProceso();
  }
});

function handleError(event) {
  if (event.key === "e") {
    document.removeEventListener("keydown", handleError);
    procesoError();
  }
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

function pausar() {
  if (!isPaused) {
    clearInterval(intervaloGlobal);
    clearInterval(intervaloProceso);
    isPaused = true;
    alert("La ejecución de los procesos se pausó.");
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

    // Si hay un proceso en curso, reanudar su tiempo restante
    if (procesoActual) {
      ejecutarProceso(true); // pasa true para indicar que es una reanudación
    }
    
    alert("La ejecución continúa");
  }
}

function Procesos() {
  const numProcesos = parseInt(document.getElementById("numElm").value, 10);
  const operaciones = ["suma", "resta", "multiplicacion", "division", "modulo"];

  for (let i = 0; i < numProcesos; i++) {
    const tiempo = Math.floor(Math.random() * 15) + 1;
    const numero1 = Math.floor(Math.random() * 99) + 1;
    const numero2 = Math.floor(Math.random() * 99) + 1;
    const operacion = operaciones[Math.floor(Math.random() * operaciones.length)];

    const nuevoProceso = {
      id: idContador++,
      numero1,
      numero2,
      operacion,
      tiempo,
      tiempoRestante: tiempo,
    };

    procesos.push(nuevoProceso);
  }
  
  actualizarLotes();
}

function actualizarLotes() {
  while (procesos.length > 0) {
    lotes.push(procesos.splice(0, 5));
  }

  mostrarProcesosPendientes(); // Mostrar la lista de procesos pendientes
}

function mostrarProcesosPendientes() {
  const procesosPendientesList = document.getElementById("procesosPendientes");
  procesosPendientesList.innerHTML = ""; // Limpiar la lista

  // Mostrar solo los procesos que aún no se han ejecutado (no están en el lote en ejecución)
  lotes.slice(1).forEach((lote, index) => { // Usamos slice(1) para ignorar el lote en ejecución
    lote.forEach((proceso) => {
      const li = document.createElement("li");
      li.textContent = `ID: ${proceso.id} - Operación: ${proceso.operacion} - Tiempo: ${proceso.tiempo} segundos`;
      procesosPendientesList.appendChild(li);
    });
  });
  
}

function Iniciar() {
  contadorGlobal = 0;
  intervaloGlobal = setInterval(() => {
    contadorGlobal++;
    document.getElementById("contadorGlobal").textContent = contadorGlobal;
  }, 1000);
  ejecutar();
}

function ejecutar() {
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

function bloquearProceso() {
  if (procesoActual && !isPaused) {
    // Clonar el proceso actual para bloquearlo y añadirlo a la lista de procesos pendientes
    const procesoClonado = { ...procesoActual };
    procesoBloqueado.push(procesoClonado); // Mover a la lista de bloqueados
    mostrarBloq(); // Mostrar la lista de bloqueados

    // Detener el proceso actual y continuar con el siguiente
    clearInterval(intervaloProceso);
    ejecutarProceso();

    // Después de 7 segundos, desbloquear el proceso
    setTimeout(() => {
      if (procesoBloqueado.length > 0) {
        const procesoDesbloqueado = procesoBloqueado.shift(); // Remover de bloqueados
        procesoDesbloqueado.tiempoRestante = procesoDesbloqueado.tiempoRestante; // Mantener el tiempo restante
        loteEnEjecucion.push(procesoDesbloqueado); // Reintroducir en el lote en ejecución

        mostrarLote(); // Actualizar visualización del lote en ejecución
        mostrarBloq(); // Actualizar visualización de bloqueados
      }
    }, 7000);
  }
}

function mostrarBloq() {
  const procesoBloqList = document.getElementById("procesoBloqueado");
  procesoBloqList.innerHTML = ""; // Limpiar la lista

  procesoBloqueado.forEach((proceso) => {
    const li = document.createElement("li");
    li.textContent = `ID: ${proceso.id} - ${proceso.tiempoRestante} segundos`;
    procesoBloqList.appendChild(li);
  });
}


function ejecutarProceso(isReanudacion = false) {
  if (!isReanudacion && loteEnEjecucion.length > 0) {
    procesoActual = loteEnEjecucion.shift();
  }

  if (procesoActual) {
    const updateProcesoInfo = () => {
      document.getElementById("procesoEnEjecucion").innerHTML = `
          <li>ID: ${procesoActual.id}</li>
          <li>Operación: ${procesoActual.operacion}</li>
          <li>Operandos: ${procesoActual.numero1}, ${procesoActual.numero2}</li>
          <li>Tiempo Máximo Estimado: ${procesoActual.tiempoRestante} segundos</li>
        `;
    };

    updateProcesoInfo();

    // Mantener la sincronización con el tiempo restante del proceso
    intervaloProceso = setInterval(() => {
      if (!isPaused) {
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
            document.getElementById("procesosTerminados").appendChild(liSeparador);
            ejecutar();
          }
        }
      }
    }, 1000); // Mantener el intervalo de 1 segundo para sincronizar
  } else {
    finalizarEjecucion();
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

  const resultado = Operacion(procesoActual.operacion, procesoActual.numero1, procesoActual.numero2);

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

function finalizarEjecucion() {
  clearInterval(intervaloGlobal);
  clearInterval(intervaloProceso);
  alert("La ejecución ha terminado.");
  procesoActual = null;
}

