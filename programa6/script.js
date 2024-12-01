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
let totalPendientes = 0;
let procesosTerminados = [];
let tiempoBloqueoPausado = false;
let procesosNuevos = [];
let procesosPendientes = [];
let procesosBloqueados = [];
let procesoEnEjecucion = null;

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "p") {
    pausar();
  } else if (event.key.toLowerCase() === "c") {
    tabla();
    continuar();
  } else if (event.key.toLowerCase() === "i") {
    bloquearProceso();
  } else if (event.key.toLowerCase() === "e") {
    procesoError();
  } else if (event.key.toLowerCase() === "n") {
    nuevoProceso();
  } else if (event.key.toLowerCase() === "t") {
    console.log("Mostrar tabla");
    tabla();
    pausar();
  }
});

// Actualización para agregar tiempoServicio
function agregarProceso(proceso) {
  proceso.tiempoServicio = 0; // Inicializar tiempo de servicio
  procesosPendientes.push(proceso); // Asegúrate de que los nuevos procesos se agreguen aquí
  actualizarTablaProcesos();
}

function tabla() {
  const tablaContainer = document.getElementById("tablaProcesosTerminados");
  const tablaListos = document.getElementById("tablaListos");
  const tablaCola = document.getElementById("tablaCola");
  if (
    tablaContainer.style.display === "none" ||
    tablaContainer.style.display === ""
  ) {
    tablaContainer.style.display = "block";
    tablaListos.style.display = "block";
    tablaCola.style.display = "block";
  } else {
    tablaContainer.style.display = "none";
    tablaListos.style.display = "none";
    tablaCola.style.display = "none";
    return;
  }

  const tablaProcesosTerminados = document.getElementById(
    "procesosTerminadosTable"
  );

  tablaProcesosTerminados.innerHTML = `
    <tr>
     
    </tr>
  `;

  const nuevaFila = tablaProcesosTerminados.insertRow();
  nuevaFila.insertCell(0).textContent = procesoActual.id;
  nuevaFila.insertCell(
    1
  ).textContent = `${procesoActual.numero1} ${procesoActual.operacion} ${procesoActual.numero2}`;
  nuevaFila.insertCell(2).textContent = procesoActual.resultado;
  nuevaFila.insertCell(3).textContent = procesoActual.tiempoDeLlegada;
  nuevaFila.insertCell(4).textContent = procesoActual.tiempoDeInicio;
  nuevaFila.insertCell(5).textContent = procesoActual.tiempoDeFinalizacion;
  nuevaFila.insertCell(6).textContent =
    procesoActual.tiempoDeInicio - procesoActual.tiempoDeLlegada; // Tiempo de respuesta
  nuevaFila.insertCell(7).textContent = procesoActual.tiempoServicio; // Tiempo de servicio
  nuevaFila.insertCell(8).textContent = "N/A"; // Tiempo total en el sistema
  nuevaFila.insertCell(9).textContent = procesoActual.tiempoRestante;
  nuevaFila.insertCell(10).textContent = "Ejecucion"; // Estado bloqueado

  // Procesos bloqueados

  procesoBloqueado.forEach((proceso) => {
    const nuevaFila = tablaProcesosTerminados.insertRow();
    console.log(proceso);
    nuevaFila.insertCell(0).textContent = proceso.id;
    nuevaFila.insertCell(
      1
    ).textContent = `${proceso.numero1} ${proceso.operacion} ${proceso.numero2}`;
    nuevaFila.insertCell(2).textContent = "NULL";
    nuevaFila.insertCell(3).textContent = proceso.tiempoDeLlegada;
    nuevaFila.insertCell(4).textContent = proceso.tiempoDeInicio || "N/A";
    nuevaFila.insertCell(5).textContent = "N/A";
    nuevaFila.insertCell(6).textContent = proceso.tiempoDeInicio;
    nuevaFila.insertCell(7).textContent = proceso.tiempoBloqueadoRestante; // Tiempo bloqueado restante
    nuevaFila.insertCell(8).textContent = "N/A";
    nuevaFila.insertCell(
      9
    ).textContent = `Tiempo bloqueado restante: ${proceso.tiempoBloqueadoRestante}`;
    nuevaFila.insertCell(10).textContent = "Bloqueado"; // Estado bloqueado
  });

  // Procesos terminados
  procesosTerminados.forEach((proceso) => {
    const nuevaFila = tablaProcesosTerminados.insertRow();

    nuevaFila.insertCell(0).textContent = proceso.id;
    nuevaFila.insertCell(
      1
    ).textContent = `${proceso.numero1} ${proceso.operacion} ${proceso.numero2}`;
    nuevaFila.insertCell(2).textContent = proceso.resultado;
    nuevaFila.insertCell(3).textContent = proceso.tiempoDeLlegada;
    nuevaFila.insertCell(4).textContent = proceso.tiempoDeInicio;
    nuevaFila.insertCell(5).textContent = proceso.tiempoDeFinalizacion;
    nuevaFila.insertCell(6).textContent =
      proceso.tiempoDeInicio - proceso.tiempoDeLlegada;
    nuevaFila.insertCell(7).textContent =
      proceso.tiempoDeFinalizacion - proceso.tiempoDeInicio;
    nuevaFila.insertCell(8).textContent =
      proceso.tiempoDeFinalizacion - proceso.tiempoDeLlegada;
    nuevaFila.insertCell(9).textContent = proceso.tiempoRestante;
    nuevaFila.insertCell(10).textContent = "Terminado"; // Estado bloqueado
  });

  //console.log(p);
}

function actualizarTablaProcesos() {
  // Limpiar la tabla de procesos pendientes
  let tablaPendientes = document.getElementById("tablaPendientes");
  tablaPendientes.innerHTML = "";

  // Mostrar los procesos pendientes (esperando para ser ejecutados)
  procesosPendientes.forEach((proceso) => {
    let fila = document.createElement("tr");
    fila.innerHTML = `<td>${proceso.id}</td><td>Pendiente</td>`;
    tablaPendientes.appendChild(fila);
  });

  // Mostrar el proceso en ejecución
  if (procesoEnEjecucion) {
    let fila = document.createElement("tr");
    fila.innerHTML = `<td>${procesoEnEjecucion.id}</td><td>En ejecución</td>`;
    tablaPendientes.appendChild(fila);
  }

  // También puedes mostrar los procesos bloqueados aquí
  actualizarTablaBloqueados();

  // Actualizar la tabla de procesos terminados
  actualizarTablaTerminados();
}

// Función para actualizar la tabla de procesos terminados
function actualizarTablaTerminados() {
  let tablaTerminados = document.getElementById("tablaTerminados");
  tablaTerminados.innerHTML = "";

  procesosTerminados.forEach((proceso) => {
    let fila = document.createElement("tr");
    fila.innerHTML = `<td>${proceso.id}</td><td>Terminado</td>`;
    tablaTerminados.appendChild(fila);
  });
}

// Función para actualizar la tabla de procesos bloqueados
function actualizarTablaBloqueados() {
  let tablaBloqueados = document.getElementById("tablaBloqueados");
  tablaBloqueados.innerHTML = "";

  procesosBloqueados.forEach((proceso) => {
    let fila = document.createElement("tr");
    fila.innerHTML = `<td>${proceso.id}</td><td>Bloqueado</td>`;
    tablaBloqueados.appendChild(fila);
  });
}

// Simulación de cambiar el estado de los procesos
function ejecutarProcesos() {
  // Si no hay proceso en ejecución y hay procesos pendientes
  if (!procesoEnEjecucion && procesosPendientes.length > 0) {
    procesoEnEjecucion = procesosPendientes.shift(); // Tomar el primer proceso pendiente
    procesoEnEjecucion.tiempoServicio = 0; // Reiniciar el tiempo de servicio
  }

  // Simulación de ejecución (ejemplo)
  if (procesoEnEjecucion) {
    procesoEnEjecucion.tiempoServicio++; // Incrementar el tiempo de servicio

    setTimeout(() => {
      // Mover el proceso a terminado después de un tiempo simulado
      procesosTerminados.push({ ...procesoEnEjecucion }); // Guardar en terminados
      procesoEnEjecucion = null; // Ya no está en ejecución

      // Actualizar tablas
      actualizarTablaProcesos();
    }, 3000); // Tiempo de ejecución simulado (3 segundos por proceso)
  }

  actualizarTablaProcesos();
}

function agregarProceso(proceso) {
  proceso.tiempoRespuesta = null; // Inicializar tiempo de respuesta
  procesosPendientes.push(proceso); // Agregar el proceso
  actualizarTablaProcesos();
}

// Inicializar con algunos procesos
agregarProceso({ id: 1 });
agregarProceso({ id: 2 });
agregarProceso({ id: 3 });
agregarProceso({ id: 4 });

// Iniciar la ejecución de procesos (simulación)
setInterval(ejecutarProcesos, 5000); // Ejecutar procesos cada 5 segundos

// Eventos de teclas para gestionar la visualización
document.addEventListener("keydown", function (event) {
  if (event.key === "t") {
    actualizarTablaProcesos(); // Mostrar la tabla de procesos
  }

  if (event.key === "n") {
    // Añadir un nuevo proceso con ID automático
    let nuevoProcesoId = procesosNuevos.length + 1;
    agregarProceso({ id: nuevoProcesoId });
    procesosNuevos.push({ id: nuevoProcesoId });
  }
});

function nuevoProceso() {
  const operaciones = ["suma", "resta", "multiplicacion", "division", "modulo"];
  const tiempo = Math.floor(Math.random() * 15) + 1;
  const numero1 = Math.floor(Math.random() * 99) + 1;
  const numero2 = Math.floor(Math.random() * 99) + 1;
  const operacion = operaciones[Math.floor(Math.random() * operaciones.length)];
  let tiempoDeLlegada = contadorGlobal;

  const nuevoProceso = {
    id: idContador++,
    numero1,
    numero2,
    operacion,
    tiempo,
    tiempoRestante: tiempo,
    tiempoDeLlegada,
    tiempoDeInicio: null,
    tiempoDeFinalizacion: null,
  };

  const existeEnPendientes = procesos.some((p) => p.id === nuevoProceso.id);

  if (!existeEnPendientes) {
    // Si el proceso no existe, lo agregamos
    if (procesoBloqueado.length + loteEnEjecucion <= 5) {
      procesos.push(nuevoProceso);
    } else {
      if (loteEnEjecucion.length < 4) {
        loteEnEjecucion.push(nuevoProceso);
      } else {
        procesos.push(nuevoProceso);
      }
    }

    // Actualizar la interfaz
    actualizarLotes();
    mostrarLote();
    mostrarProcesosPendientes();
  } else {
    console.log(
      "El proceso ya existe en la lista de pendientes y no se ha agregado."
    );
  }
}

function procesoError() {
  if (procesoActual) {
    // Crear un nuevo objeto de proceso para los procesos terminados
    const procesoError = {
      id: procesoActual.id,
      numero1: procesoActual.numero1,
      numero2: procesoActual.numero2,
      operacion: procesoActual.operacion,
      resultado: "Error", // Asignar que ha terminado con error
      tiempoDeLlegada: procesoActual.tiempoDeLlegada,
      tiempoDeInicio: procesoActual.tiempoDeInicio,
      tiempoDeFinalizacion: contadorGlobal, // Valor actual de tiempo global
    };

    procesosTerminados.push(procesoError); // Agregar a la lista de procesos terminados

    // Restablecer proceso actual
    procesoActual = null;

    // Continuar con el siguiente proceso
    if (loteEnEjecucion.length > 0) {
      ejecutarProceso();
    } else {
      ejecutar(); // Llama nuevamente a la función para procesar otros lotes
    }
  } else {
    alert("No hay proceso en ejecución para terminar con error.");
  }
}

function pausar() {
  if (!isPaused && (intervaloGlobal || intervaloProceso)) {
    clearInterval(intervaloGlobal);
    clearInterval(intervaloProceso);
    isPaused = !isPaused;
    alert("La ejecución de los procesos se pausó.");
  }
}

function continuar() {
  if (isPaused) {
    isPaused = !isPaused;

    intervaloGlobal = setInterval(() => {
      contadorGlobal++;
      document.getElementById("contadorGlobal").textContent = contadorGlobal;
    }, 1000);

    if (procesoActual) {
      ejecutarProceso(true); // Reanudar
    }
    const tablaContainer = document.getElementById("tablaProcesosTerminados");
    if (tablaContainer.style.display === "block") {
      tablaContainer.style.display = "none";
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
    const operacion =
      operaciones[Math.floor(Math.random() * operaciones.length)];

    let tiempoDeLlegada = procesos.length < 5 ? 0 : contadorGlobal;

    const nuevoProceso = {
      id: idContador++,
      numero1,
      numero2,
      operacion,
      tiempo,
      tiempoRestante: tiempo,
      tiempoDeLlegada,
      tiempoDeInicio: null,
      tiempoDeFinalizacion: null,
    };

    procesos.push(nuevoProceso);
  }

  actualizarLotes();
}

function actualizarLotes() {
  while (procesos.length > 0) {
    lotes.push(procesos.splice(0, 5));
  }

  mostrarProcesosPendientes();
}

function mostrarProcesosPendientes() {
  const procesosPendientesList = document.getElementById("procesosPendientes");
  procesosPendientesList.innerHTML = "";

  totalPendientes = 0;

  const tablaNuevos = document.getElementById("colaTableBody");
  tablaNuevos.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos procesos

  lotes.forEach((lote) => {
    lote.forEach((proceso) => {
      totalPendientes++;
      const li = document.createElement("li");
      li.textContent = `ID: ${proceso.id} - Tiempo restante: ${proceso.tiempoRestante} segundos`;
      procesosPendientesList.appendChild(li);

      const nuevaFila = tablaNuevos.insertRow();
      nuevaFila.insertCell(0).textContent = proceso.id;
      nuevaFila.insertCell(
        1
      ).textContent = `${proceso.numero1} ${proceso.operacion} ${proceso.numero2}`;
      nuevaFila.insertCell(2).textContent = "NULL";
      nuevaFila.insertCell(3).textContent = "NULL";
      nuevaFila.insertCell(4).textContent = "NULL";
      nuevaFila.insertCell(5).textContent = "NULL";
      nuevaFila.insertCell(6).textContent = "NULL";
      nuevaFila.insertCell(7).textContent = "NULL"; // Tiempo bloqueado restante
      nuevaFila.insertCell(8).textContent = "NULL";
      nuevaFila.insertCell(9).textContent = proceso.tiempoRestante;
      nuevaFila.insertCell(10).textContent = "Nuevos";
    });
  });

  const liTotal = document.createElement("li");
  liTotal.textContent = `Total de procesos en espera: ${totalPendientes}`;
  procesosPendientesList.appendChild(liTotal);
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
  const tablaListos = document.getElementById("listosTableBody");
  tablaListos.innerHTML = "";

  // Si hay lotes disponibles
  if (lotes.length > 0) {
    // Asigna un nuevo lote a `loteEnEjecucion`
    loteEnEjecucion = lotes.shift();

    // Asigna tiempo de llegada si aún no ha sido asignado
    loteEnEjecucion.forEach((proceso) => {
      if (proceso.tiempoDeLlegada === 0) {
        proceso.tiempoDeLlegada = contadorGlobal;
      }
    });

    // Ahora, mostrar los procesos del lote en la tabla de listos

    // Ejecutar el siguiente proceso
    mostrarLote();
    ejecutarProceso();
  } else {
    finalizarEjecucion();
  }
}

function mostrarLote() {
  const loteEnEjecucionList = document.getElementById("loteEnEjecucion");
  loteEnEjecucionList.innerHTML = "";

  const tablaListos = document.getElementById("listosTableBody");
  tablaListos.innerHTML = "";

  if (loteEnEjecucion.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay procesos listos";
    loteEnEjecucionList.appendChild(li);
  } else {
    loteEnEjecucion.forEach((proceso) => {
      const li = document.createElement("li");
      li.textContent = `ID: ${proceso.id} - Tiempo Maximo estimado ${proceso.tiempo} segundos - Tiempo restante: ${proceso.tiempoRestante} segundos`;

      const nuevaFila = tablaListos.insertRow();
      nuevaFila.insertCell(0).textContent = proceso.id;
      nuevaFila.insertCell(
        1
      ).textContent = `${proceso.numero1} ${proceso.operacion} ${proceso.numero2}`;
      nuevaFila.insertCell(2).textContent = "NULL"; // Resultado aún no disponible
      nuevaFila.insertCell(3).textContent = proceso.tiempoDeLlegada;
      nuevaFila.insertCell(4).textContent = proceso.tiempoDeInicio || "N/A";
      nuevaFila.insertCell(5).textContent = "N/A"; // Aún no terminado
      nuevaFila.insertCell(6).textContent = "N/A"; // Aún no terminado
      nuevaFila.insertCell(7).textContent = "N/A"; // No bloqueado
      nuevaFila.insertCell(8).textContent = "N/A"; // No terminado
      nuevaFila.insertCell(9).textContent = proceso.tiempoRestante;
      nuevaFila.insertCell(10).textContent = "Listos";

      loteEnEjecucionList.appendChild(li);
    });
  }

  document.getElementById("lotesPendientes").textContent = lotes.length;
}

function bloquearProceso() {
  if (procesoActual && !isPaused) {
    const procesoClonado = { ...procesoActual };
    procesoClonado.tiempoBloqueadoRestante = 7;
    procesoBloqueado.push(procesoClonado);
    mostrarBloq();

    clearInterval(intervaloProceso);
    procesoActual = null;

    if (loteEnEjecucion.length > 0) {
      ejecutarProceso();
    } else if (procesoBloqueado.length > 0) {
      console.log("Esperando que se desbloqueen los procesos.");
    } else {
      ejecutar();
    }

    const intervaloBloqueo = setInterval(() => {
      if (!isPaused) {
        procesoClonado.tiempoBloqueadoRestante--;
        mostrarBloq();

        if (procesoClonado.tiempoBloqueadoRestante === 0) {
          clearInterval(intervaloBloqueo);
          const procesoDesbloqueado = procesoBloqueado.shift();
          mostrarBloq();

          procesoDesbloqueado.tiempoRestante = procesoDesbloqueado.tiempo;

          // Si ya hay 4 procesos en "listos", mover el proceso desbloqueado a "nuevos"
          if (loteEnEjecucion.length < 4) {
            loteEnEjecucion.push(procesoDesbloqueado);
            mostrarLote();
          } else {
            procesos.push(procesoDesbloqueado); // Mover a la lista de "nuevos"
            mostrarProcesosPendientes(); // Actualizar la lista de procesos pendientes
          }

          if (!procesoActual) {
            ejecutarProceso();
          }
        }
      }
    }, 1000);
  }
}

function mostrarBloq() {
  const procesoBloqList = document.getElementById("procesoBloqueado");
  procesoBloqList.innerHTML = "";

  procesoBloqueado.forEach((proceso) => {
    const li = document.createElement("li");
    li.textContent = `ID: ${proceso.id} - Tiempo bloqueado restante: ${proceso.tiempoBloqueadoRestante} segundos`;
    procesoBloqList.appendChild(li);
  });
}

function ejecutarProceso(isReanudacion = false) {
  if (!isReanudacion && loteEnEjecucion.length > 0) {
    procesoActual = loteEnEjecucion.shift();
    procesoActual.tiempoDeInicio = contadorGlobal;

    // Calcular tiempo de respuesta al iniciar el proceso
    procesoActual.tiempoRespuesta =
      procesoActual.tiempoDeInicio - procesoActual.tiempoDeLlegada;

    // Inicializa el tiempo de servicio a 0 al iniciar el proceso
    procesoActual.tiempoServicio = 0;

    mostrarProcesosPendientes();
    mostrarLote();
  }

  if (procesoActual) {
    const updateProcesoInfo = () => {
      document.getElementById("procesoEnEjecucion").innerHTML = `
              <li>ID: ${procesoActual.id}</li>
              <li>Operación: ${procesoActual.operacion}</li>
              <li>Operandos: ${procesoActual.numero1}, ${
        procesoActual.numero2
      }</li>
              <li>Tiempo Máximo Estimado: ${procesoActual.tiempo}</li>
              <li>Tiempo Restante: ${procesoActual.tiempoRestante}</li>
              <li>Tiempo de Respuesta: ${
                procesoActual.tiempoRespuesta || "N/A"
              }</li>
              <li>Tiempo de Servicio: ${procesoActual.tiempoServicio}</li>
          `;
    };

    updateProcesoInfo();

    intervaloProceso = setInterval(() => {
      if (!isPaused) {
        procesoActual.tiempoRestante--;
        procesoActual.tiempoServicio++; // Incrementar tiempo de servicio

        updateProcesoInfo();

        if (procesoActual.tiempoRestante === 0) {
          clearInterval(intervaloProceso);

          procesoActual.tiempoDeFinalizacion = contadorGlobal;

          const resultado = ejecutarOperacion(
            procesoActual.operacion,
            procesoActual.numero1,
            procesoActual.numero2
          );

          procesoActual.resultado = resultado;

          // Agregar el proceso terminado a la lista de procesosTerminados
          procesosTerminados.push(procesoActual);

          procesoActual = null;

          if (loteEnEjecucion.length > 0) {
            ejecutarProceso();
          } else {
            ejecutar();
          }
        }
      }
    }, 1000); // Se ejecuta cada 1 segundo
  }
}

function ejecutarOperacion(operacion, numero1, numero2) {
  switch (operacion) {
    case "suma":
      return numero1 + numero2;
    case "resta":
      return numero1 - numero2;
    case "multiplicacion":
      return numero1 * numero2;
    case "division":
      return numero2 === 0 ? "Error (división por cero)" : numero1 / numero2;
    case "modulo":
      return numero2 === 0 ? "Error (división por cero)" : numero1 % numero2;
    default:
      return "Operación no reconocida";
  }
}

function finalizarEjecucion() {
  clearInterval(intervaloGlobal);
  alert("Todos los lotes han sido procesados.");
}
