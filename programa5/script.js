const bufferSize = 20;
let buffer = new Array(bufferSize).fill(null);
let producerIndex = 0;
let consumerIndex = 0;

let producerStatus = document.getElementById('producerStatus');
let consumerStatus = document.getElementById('consumerStatus');
const bufferContainer = document.getElementById('buffer');

// Inicializa el contenedor visual
for (let i = 0; i < bufferSize; i++) {
    let cellWrapper = document.createElement('div');
    cellWrapper.className = 'cell-wrapper';

    let letter = document.createElement('div');
    letter.className = 'letter';
    letter.id = 'letter-' + i;

    let cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = 'cell-' + i;
    cell.textContent = i + 1;

    cellWrapper.appendChild(letter);
    cellWrapper.appendChild(cell);
    bufferContainer.appendChild(cellWrapper);
}

// Simular tiempos aleatorios
function randomTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Productor
async function producer() {
    while (true) {
        producerStatus.textContent = 'Estado del Productor: Dormido';
        await sleep(randomTime(1000, 3000));

        let itemsToProduce = randomTime(3, 6);
        producerStatus.textContent = `Productor intenta producir ${itemsToProduce} elementos`;

        for (let i = 0; i < itemsToProduce; i++) {
            if (buffer[producerIndex] === null) {
                let imagen = document.createElement('img');
                imagen.src = 'dona.png';  // Imagen de la galleta
                imagen.width = 20;
                imagen.height = 20;

                buffer[producerIndex] = imagen;
                updateBufferDisplay();
                producerIndex = (producerIndex + 1) % bufferSize;
            } else {
                producerStatus.textContent = 'Productor esperando: Buffer lleno';
                break;
            }
        }

        await sleep(randomTime(1000, 2000));
    }
}

// Consumidor
async function consumer() {
    while (true) {
        consumerStatus.textContent = 'Estado del Consumidor: Dormido';
        await sleep(randomTime(1000, 3000));

        let itemsToConsume = randomTime(3, 6);
        consumerStatus.textContent = `Consumidor intenta consumir ${itemsToConsume} elementos`;

        for (let i = 0; i < itemsToConsume; i++) {
            if (buffer[consumerIndex] !== null) {
                buffer[consumerIndex].src = 'pacman.png'; // Cambia a imagen del consumidor
                updateBufferDisplay();

                await sleep(500); // Esperar para mostrar el "consumo"
                buffer[consumerIndex] = null; // Eliminar el elemento después de consumir
                updateBufferDisplay();

                consumerIndex = (consumerIndex + 1) % bufferSize;
            } else {
                consumerStatus.textContent = 'Consumidor esperando: Buffer vacío';
                break;
            }
        }

        await sleep(randomTime(1000, 2000));
    }
}

// Actualizar la visualización del buffer
function updateBufferDisplay() {
    for (let i = 0; i < bufferSize; i++) {
        let letter = document.getElementById('letter-' + i);
        let cell = document.getElementById('cell-' + i);

        if (buffer[i] === null) {
            letter.innerHTML = '';         
            cell.textContent = i + 1;     
        } else if (buffer[i] instanceof HTMLElement) {
            letter.innerHTML = '';         
            letter.appendChild(buffer[i]); 
        }
    }
}

// Simular "dormir" 
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Salir
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.body.innerHTML = '';
        let message = document.createElement('div');
        message.className = 'final-message';
        message.textContent = 'Programa finalizado';
        document.body.appendChild(message);
    }
});

producer();
consumer();
