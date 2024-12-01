let procesos = [];//donde se guardan los procesos
let lotes = [];//donde se guardan los lotes (con los procesos)
let loteEnEjecucion = [];//los que se van ejecutando
let procesoActual = null;//sin valor hasta que se le asigne
let contadorGlobal = 0;
let intervaloGlobal;//para que valla avanzando
let idContador = 1;//para que sea unico

function Procesos() {
  const procesos = parseInt(document.getElementById("numElm").value, 10);

  const formulario = document.getElementById("procesosForm");
  formulario.innerHTML = "";

  for (let i = 0; i < procesos; i++) {
    const procesoForm = document.createElement("div");
    //inserta el contenido HTML
    procesoForm.innerHTML = `
        <label for="nombre${i}">Ingresa el nombre:</label>
        <input type="text" id="nombre${i}" />
        <br /><br />

        <label for="tiempo${i}">Ingresa el tiempo máximo estimado:</label>
        <input type="number" id="tiempo${i}" min="1" onchange="validarTiempo(${i})" required />
        <br /><br />

        <label for="numero1${i}">Ingresa el primer numero:</label>
        <input type="number" id="numero1${i}" onchange="validarNumero(${i})" />
        <br /><br />

        <label for="numero2${i}">Ingresa el segundo numero:</label>
        <input type="number" id="numero2${i}" onchange="validarNumero(${i})" />
        <br /><br />

        <label for="operacion${i}">Selecciona una operacion:</label>
        <select id="operacion${i}" onchange="validarNumero(${i})">
          <option value="">--Selecciona--</option>
          <option value="suma">Suma</option>
          <option value="resta">Resta</option>
          <option value="multiplicacion">Multiplicacion</option>
          <option value="division">Division</option>
          <option value="modulo">Modulo</option>
        </select>
        <br /><br />
        <br /><br />
    `;

    formulario.appendChild(procesoForm); //para asignar hijos y aparezcan todos
  }
  document.getElementById("formularioProcesos").style.display = "block"; //sin esto no aparecen en pantalla
}


function agregarProcesos() {
  const numProcesos = document.getElementById("procesosForm").children.length;//guarda todos los procesos ingresados

  for (let i = 0; i < numProcesos; i++) {
    const nombre = document.getElementById(`nombre${i}`).value;
    const id = Math.floor(Math.random() * 1000) + 1;
    const tiempo = parseInt(document.getElementById(`tiempo${i}`).value, 10);//todos estos se tienen que guardar como enteros (numeros)
    //si no se quedan como string y son undefined
    const numero1 = parseFloat(document.getElementById(`numero1${i}`).value);
    const numero2 = parseFloat(document.getElementById(`numero2${i}`).value);
    const operacion = document.getElementById(`operacion${i}`).value;

   


    //el objeto donde se guardan los datos
    const nvoProceso = {
      nombre,
      id: idContador++,
      numero1,
      numero2,
      operacion,
      tiempoRestante: tiempo,
    };

    procesos.push(nvoProceso);//metemos el objeto como elemento del arreglo de los procesos, asi se van guardando
    //todos los ingresados
  }
  actualizarLotes();
}

function validarCampos() {
  const numProcesos = document.getElementById("procesosForm").children.length; // Obtener el número de procesos

  for (let i = 0; i < numProcesos; i++) {
    const nombre = document.getElementById(`nombre${i}`).value;
    const tiempo = document.getElementById(`tiempo${i}`).value;
    const numero1 = document.getElementById(`numero1${i}`).value;
    const numero2 = document.getElementById(`numero2${i}`).value;
    const operacion = document.getElementById(`operacion${i}`).value;

    // Verificar si algún campo está vacío
    if (!nombre.trim() || !tiempo || !numero1 || !numero2 || !operacion) {
      alert(`Por favor, completa todos los campos del proceso ${i + 1}`);
      return; // Detener si falta algún campo
    }
  }

  // Si todos los campos están completos, se agregan los procesos
  agregarProcesos();
}

function validarTiempo(i) {
  const tiempo = parseInt(document.getElementById(`tiempo${i}`).value, 10);
  
  if (tiempo <= 0) {
    alert("El tiempo máximo estimado debe ser mayor a 0.");
    document.getElementById(`tiempo${i}`).value = ""; // Limpiar campo si no es válido
  }
}

function actualizarLotes() {
  if (procesos.length > 0) {//mientras haya procesos
    while (procesos.length > 0) {
      lotes.push(procesos.splice(0, 5));//para que solo guarde hasta 5 en el arreglo de los lotes
      //metemos el arreglo con los procesos en el arreglo de los lotes
    }
    document.getElementById("lotesPendientes").textContent = lotes.length;//mostrar variable en el html
  }
}
function Iniciar() {
  contadorGlobal = 0;
  intervaloGlobal = setInterval(() => {
    contadorGlobal++;
    document.getElementById("contadorGlobal").textContent = contadorGlobal;//asignar la variable en el span
  }, 1000);

  ejecutar();
}

function ejecutar() {
  if (lotes.length > 0) {
    loteEnEjecucion = lotes.shift();//va "vaciando" los lotes para que asi se vallan mostrando de 5 en 5
    document.getElementById("loteEnEjecucion").innerHTML = "";//vaciar lo que hay en la lista (tambien puede ser un div)
    loteEnEjecucion.forEach((proceso) => {//recorrer todo el arreglo donde proceso es un elemento de el
      const li = document.createElement("li");//crear elemento html
      li.textContent = `${proceso.nombre} - ${proceso.tiempoRestante} segundos`;
      document.getElementById("loteEnEjecucion").appendChild(li);
    });
    document.getElementById("lotesPendientes").textContent = lotes.length;//mostrar variable en el html

    ejecutarProceso();
  } else {
    clearInterval(intervaloGlobal);
    alert("Todos los lotes han sido ejecutados.");
    
    
  }
}
function ejecutarProceso() {
  if (loteEnEjecucion.length > 0) {
    procesoActual = loteEnEjecucion.shift(); // Eliminar el primer proceso del lote

    // Actualizar la lista visual de procesos en ejecución
    const loteEnEjecucionList = document.getElementById("loteEnEjecucion");
    const procesoItem = loteEnEjecucionList.children[0]; // Selecciona el primer proceso en la lista

    document.getElementById("procesoEnEjecucion").innerHTML = `
        <li>Nombre: ${procesoActual.nombre}</li>
        <li>Operación: ${procesoActual.operacion}</li>
        <li>Operandos: ${procesoActual.numero1}, ${procesoActual.numero2}</li>
        <li>Tiempo Máximo Estimado: ${procesoActual.tiempoRestante} segundos</li>
        <li>ID: ${procesoActual.id}</li>
    `;

    const intervaloProceso = setInterval(() => {
      procesoActual.tiempoRestante--;
      document.getElementById(
        "procesoEnEjecucion"
      ).innerHTML += `<li>Tiempo Restante: ${procesoActual.tiempoRestante} segundos</li>`;
      if (procesoActual.tiempoRestante <= 0) {
        clearInterval(intervaloProceso);
        procesarResultado();

        // Elimina el proceso terminado de la lista visual
        loteEnEjecucionList.removeChild(procesoItem);

        if (loteEnEjecucion.length > 0) {
          ejecutarProceso();
        } else {
          // linea despues de los lotes
          const li = document.createElement("li");
          li.textContent = "----------------------------"; 
          li.style.listStyleType = "none"; // Sin vi;eta
          document.getElementById("procesosTerminados").appendChild(li); 

          ejecutar(); // si no quedan procesos en el lote actual, pasa al siguiente lote
        }
      }
    }, 1000);
  }
}

function procesarResultado() {
    let op = "";
  
    switch(procesoActual.operacion) {
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
  
    const li = document.createElement("li");
    li.textContent = `Programa ${procesoActual.id}: ${procesoActual.numero1} ${op} ${procesoActual.numero2} = ${resultado}`;
    document.getElementById("procesosTerminados").appendChild(li);
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
      if (numero2 === 0) {
        alert("No se puede dividir por cero");
      } else {
        return numero1 / numero2;
      }

    case "modulo": 
      if (numero2 === 0) {
        alert("No se puede dividir por cero");
        return null;
      } else {
        return numero1 % numero2;
      }
  }
}

function validarNumero(i) {
  const numero1 = parseFloat(document.getElementById(`numero1${i}`).value);
  const numero2 = parseFloat(document.getElementById(`numero2${i}`).value);
  const operacion = document.getElementById(`operacion${i}`).value;

  
  if (operacion === "division" || operacion === "modulo") {
    if (numero1 === 0) {
      alert("No se puede usar el número 0 en el primer operando para la operación de división o módulo.");
      document.getElementById(`numero1${i}`).value = ""; // Limpiar campo
    }
    if (numero2 === 0) {
      alert("No se puede usar el número 0 en el segundo operando para la operación de división o módulo.");
      document.getElementById(`numero2${i}`).value = ""; // Limpiar campo
    }
  }
}

