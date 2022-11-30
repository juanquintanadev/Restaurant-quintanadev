// vamos a crear un objeto donde vamos a guardar los datos de la ventana modal y sus pedidos, la inicializamos vacio todo
let cliente = {
    mesa: '',
    hora: '',
    pedido: [],
};

// creamos las categorias que las tenemos con numeros que representan comida, bebida y postre
const categoriaCodigo = {
    1: 'Comida',
    2: 'Bebida',
    3: 'Postre',
};

// selectores 
const btnGuardarCliente = document.querySelector('#guardar-cliente');

// eventos
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    // console.log('desde guardar cliente fn');

    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // vamos a ver otra manera de comprobar si existe algun campo vacio
    // con .some es un array method donde comprueba si en algun campo cumple con la condicion que le pasamos
    // este arreglo creado y al mismo tiempo utilizamos su array method para comprobar si alguno de los dos valores tiene un campo vacio
    const camposVacios = [mesa, hora].some(campo => campo === '');

    if(camposVacios) {
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta) {
            // aca vamos a crear el alerta
            const alertaDiv = document.createElement('DIV');
            alertaDiv.classList.add('invalid-feedback', 'text-center', 'd-block');
            alertaDiv.textContent = 'Mesa y Hora son obligatorios';

            const modalForm = document.querySelector('.modal-body form');
            modalForm.appendChild(alertaDiv);

            setTimeout(() => {
                alertaDiv.remove();
            }, 3000);
        };
        return;
    };

    // pasamos la validacion y no tocamos el return, entonces esta parte del codigo sigue.
    // console.log('todos los campos estan llenos');

    // vamos a asignar los valores al objeto utilizando spread operator
    // hay que tener en cuenta el orden que le pasamos los valores y su copia
    // primero una copia de si mismo para no perder el arreglo del pedido, y luego la mesa y la hora
    // si pasamos primero la mesa y la hora y despues una copia del arreglo, este mismo vacio reescribe todo lo anterior y perdemos los datos
    cliente = {...cliente, mesa, hora};
    // console.log(cliente);

    // ahora vamos a ocultar la ventana modal de bootstrap una vez que completamos correctamente el formulario
    // seleccionamos la ventana modal
    const ventanaModal = document.querySelector('#formulario');

    // utilizamos el framework de bootstrap para tener una instancia de la ventana modal y le asignamos nuestra ventana
    const modalBootstrap = bootstrap.Modal.getInstance(ventanaModal);

    // aqui ocultamos la ventana una vez ingresado los datos correctamente
    modalBootstrap.hide();

    // correcto todo ya mostramos todo lo que podemos pedir y esto lo extraemos de una api
    // llamamos a una funcion para mostrar las secciones de los platillos
    mostrarSecciones();

    // una vez mostramos las secciones ocultas, vamos a introducir los platillos
    // estos los tenemos en un JSON-Server
    obtenerPlatillos();
};

function mostrarSecciones() {
    // console.log('desde mostrar secciones');

    // este nos trae un node list, es como un arreglo al que podemos iterar
    const seccionesOcultas = document.querySelectorAll('.d-none');

    // iteramos con un forEach y a cada seccion le quitamos el d-none que las oculta
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
};

function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(patillos => mostrarPatillos(patillos))
        .catch(error => console.log(error));
};

function mostrarPatillos(platillos) {
    // console.log(platillos);
    
    // seleccionamos el div donde vamos a introducir todos los platillos
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach(plato => {
        // console.log(plato);

        // vamos a crear un row que nos da acceso al grid de bootstrap, permitiendo en cada elemento hijo colocar su tamaño
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4');
        nombre.textContent = plato.nombre;

        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categoriaCodigo[plato.categoria]; // el objeto creado con los id de categorias entonces los mostramos con su nombre

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${plato.precio}`;

        // vamos a crear un input tipo numero para poner las cantidades que queremos de cada plato
        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.value = 0;
        inputCantidad.min = 0;
        inputCantidad.max = 20;
        inputCantidad.classList.add('form-control'); // clase de bootstrap que le da forma
        inputCantidad.id = `producto-${plato.id}`;

        // aca vamos a asociarle una funcion cuando cambiemos el numero en el input
        inputCantidad.onchange = function() { // se hace de esta manera para que no se ejecute automaticamente, se le asigna una funcion que cuando ocurra el change esta llame a la funcion que queremos ejecutar con un parametro
            
            // referencia a la cantidad de platos del mismo id
            const cantidad = parseInt(inputCantidad.value); // lo pasamos a entero asi podemos utilizarlo para hacer operaciones aritmeticas
            // console.log(cantidad);
            agregarPlatillo({...plato, cantidad}); // mandamos en forma de objeto toda la informacion necesaria
        }; // utilizamos el spread para pasar una copia del contenido del plato, pasan los elementos solamente y a eso le agregamos el elemento de cantidad

        // colocamos el input dentro de un div para tener acceso al grid de bootstrap
        const inputDiv = document.createElement('DIV');
        inputDiv.classList.add('col-md-2');

        inputDiv.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(categoria);
        row.appendChild(precio);
        row.appendChild(inputDiv);

        contenido.appendChild(row);
    });
};

function agregarPlatillo(producto) { // recibimos la informacion necesaria para volcarlo al html y obtener el gasto
    // console.log(producto);
    // vamos a extraer el arreglo de pedido del objeto global cliente
    let {pedido} = cliente;

    // vamos a revisar que la cantidad sea mayor a 0, asi lo agregamos
    if(producto.cantidad > 0) {

        // utilizamos el .some array method para saber si un elemento contiene o no nuestra condicion, retorna true o false
        if(pedido.some(articulo => articulo.id === producto.id)) {
            // aca ya encontramos que el articulo existe entonces actualizamos el arreglo
            const pedidoActualizado = pedido.map(articulo => { // map devuelve un arreglo actualizado nuevo

                // estamos en el elemento cuya cantidad tenemos que actualizar
                if(articulo.id === producto.id) { 

                    // aca actualizamos este articulo donde es el del id igual al que le pasamos por parametro
                    articulo.cantidad = producto.cantidad;
                };

                // retornamos el articulo para que lo vaya asignando al arreglo nuevo, para no perder la referencia de los demas articulos cargados
                return articulo;
            });

            // aca asignamos el nuevo arreglo obtenido y actualizado al principal, reescribiendo totalmente el arreglo de pedido
            cliente.pedido = [...pedidoActualizado];

        } else { // si no existe el id de una articulo previamente cargado con el nuevo que se esta leyendo entonces cargamos el producto al arreglo principal del pedido
            cliente.pedido = [...pedido, producto];
        };
        // console.log(cliente);
        
    } else {
        // console.log('no es mayor a 0');
        
        // eliminar elementos cuando la cantidad sea 0
        // este nos retorna todos los que sean diferentes al que estamos eliminando, .filter trae todos menos el que tenemos en 0
        const resultado = pedido.filter(articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    };

    // aca limpiamos el html cosa de que cada vez que llamamos a un nuevo articulo este se limpie y muestre el resumen
    limpiarHtml();

    // console.log(cliente.pedido);

    // si el arreglo de cliente.pedido tiene al menos un elemento, entonces llamamos a actualizar el resumen
    if( cliente.pedido.length) {
        // una vez cargados los pedidos y pasado todas las operaciones con los inputs
        // cargamos un resumen del pedido
        actualizarResumen();
    } else {
        // si esta vacio el arreglo del pedido entonces mostramos el mensaje cuando tiene que estar vacio
        limpiarContenidoVacio();
    }

    
};

function limpiarHtml() {
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    };
};

function actualizarResumen() {
    // console.log('desde actualizar resumen');

    // seleccionamos el div donde esta el resumen y donde va a parar el contenido
    const contenido = document.querySelector('#resumen .contenido');
    
    // creamos un div donde vamos a pasar el resumen del pedido
    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');
    
    // creamos un parrafo que vamos a insertar dentro del div de contenido, y su textContent es tipo una etiqueta
    const mesa = document.createElement('P');
    mesa.classList.add('fw-bold');
    mesa.textContent = 'Mesa: ';

    // creamos el span donde colocaremos otra clase para que se diferencie
    const mesaSpan = document.createElement('SAPN');
    mesaSpan.classList.add('fw-normal');
    mesaSpan.textContent = cliente.mesa;

    const hora = document.createElement('P');
    hora.classList.add('fw-bold');
    hora.textContent = 'Hora: ';

    const horaSpan = document.createElement('SPAN');
    horaSpan.classList.add('fw-normal');
    horaSpan.textContent = cliente.hora;

    const heading = document.createElement('H3');
    heading.classList.add('text-center', 'my-4');
    heading.textContent = 'Pedido de la Mesa';

    // vamos a iterar sobre el arreglo pedidos y mostrar que pidio el usuario en esa mesa
    // creamos un grupo unorder list
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const {pedido} = cliente;
    pedido.forEach(articulo => {
        // console.log(articulo);
        const {nombre, precio, cantidad, id} = articulo;

        // creamos una lista donde vamos a ir colocando todos los datos extraidos del articulo pedido
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item'); // estilo de bootstrap

        const nombreEl = document.createElement('H4');
        nombreEl.textContent = nombre;
        nombreEl.classList.add('my-4');

        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadSpan = document.createElement('SPAN');
        cantidadSpan.classList.add('fw-normal');
        cantidadSpan.textContent = cantidad;

        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioSpan = document.createElement('SPAN');
        precioSpan.classList.add('fw-normal');
        precioSpan.textContent = `$${precio}`;

        // subtotal del precio hasta el momento
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';
        
        const subtotalSpan = document.createElement('SPAN');
        subtotalSpan.classList.add('fw-normal');
        subtotalSpan.textContent = calcularSubtotal(precio, cantidad);

        // boton para eliminar el pedido
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'ELiminar Plato';
        btnEliminar.onclick = () => {
            eliminarPedido(id);
        };

        // agregamos el span al elemento de cantidad
        cantidadEl.appendChild(cantidadSpan);
        // agregamos el span de precio a su elemento princ
        precioEl.appendChild(precioSpan);
        // subtotalSpan al subtotalEl
        subtotalEl.appendChild(subtotalSpan);

        // agrego el nombre a la lista
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);


        // agrego la lista al grupo de UL principal
        grupo.appendChild(lista);

    });
    
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    // aca vamos a colocar una funcion para que muestre el formulario de propinas
    mostrarPropinas();
};

function mostrarPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const propinasFormulario = document.createElement('DIV');
    propinasFormulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('shadow', 'card', 'py-2', 'px-3');

    // creamos un heading para este div de propinas
    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propinas!!';

    // creamos los radio button donde vamos a seleccionar el % de la propina
    // radio button de 10%
    const radio10 = document.createElement('INPUT');
    radio10.classList.add('form-check-input');
    radio10.type = 'radio';
    radio10.value = '10';
    radio10.name = 'propina';
    radio10.onclick = calcularPropina;

    const label10 = document.createElement('LABEL');
    label10.textContent = '10 %';
    label10.classList.add('form-check-label');

    const div10 = document.createElement('DIV');
    div10.classList.add('form-check');

    div10.appendChild(label10);
    div10.appendChild(radio10);

    // radio button de 25%
    const radio25 = document.createElement('INPUT');
    radio25.classList.add('form-check-input');
    radio25.type = 'radio';
    radio25.value = '25';
    radio25.name = 'propina';
    radio25.onclick = calcularPropina;

    const label25 = document.createElement('LABEL');
    label25.textContent = '25 %';
    label25.classList.add('form-check-label');

    const div25 = document.createElement('DIV');
    div25.classList.add('form-check');

    div25.appendChild(label25);
    div25.appendChild(radio25);

    // radio button de 50%
    const radio50 = document.createElement('INPUT');
    radio50.classList.add('form-check-input');
    radio50.type = 'radio';
    radio50.value = '50';
    radio50.name = 'propina';
    radio50.onclick = calcularPropina;

    const label50 = document.createElement('LABEL');
    label50.textContent = '50 %';
    label50.classList.add('form-check-label');

    const div50 = document.createElement('DIV');
    div50.classList.add('form-check');

    div50.appendChild(label50);
    div50.appendChild(radio50);

    // agregamos al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(div10);
    divFormulario.appendChild(div25);
    divFormulario.appendChild(div50);

    // agregamos al div de las propinas general
    propinasFormulario.appendChild(divFormulario);

    // aca lo agregamos a las segunda columna del contenido
    contenido.appendChild(propinasFormulario);
};

function calcularPropina() {
    // variable donde vamos a ir almacenando el subtotal
    let subtotal = 0;
    
    // extraemos el pedido para obtener la cantidad y el precio
    const {pedido} = cliente;

    // iteramos sobre el pedido que tenemos para obtener el subtotal
    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    // selector que nos ubica en los radio con name propina y que esta seleccionado, y traemos su value que asignamos en cada radio con scripting
    const radioSeleccionado = document.querySelector('[name="propina"]:checked').value;

    // calcular la propina
    const propina = subtotal * (parseInt(radioSeleccionado) / 100);
    // console.log(propina);

    // calcular el total
    const total = subtotal + propina;
    console.log(total);

    // aca llamamos a una funcion que muestre en HTML lo calculado
    mostrarHtmlPropina(total, subtotal, propina);

    // console.log(radioSeleccionado);
    // console.log(subtotal);
};

function mostrarHtmlPropina(total, subtotal, propina) {

    // un div para contener toda la informacion
    const divTotal = document.createElement('DIV');
    divTotal.classList.add('total-pagar', 'card', 'shadow', 'my-5');

    const subLabel = document.createElement('P');
    subLabel.classList.add('fs-3', 'fw-bold', 'mt-5');
    subLabel.textContent = 'Subtotal: ';

    const subSpan = document.createElement('SPAN');
    subSpan.classList.add('fw-normal');
    subSpan.textContent = `$ ${subtotal}`;

    const propLabel = document.createElement('P');
    propLabel.classList.add('fs-3', 'fw-bold', 'mt-5');
    propLabel.textContent = 'Propina: ';

    const propSpan = document.createElement('SPAN');
    propSpan.classList.add('fw-normal');
    propSpan.textContent = `$ ${propina}`;

    const totLabel = document.createElement('P');
    totLabel.classList.add('fs-3', 'fw-bold', 'mt-5');
    totLabel.textContent = 'Total: ';

    const totSpan = document.createElement('SPAN');
    totSpan.classList.add('fw-normal');
    totSpan.textContent = `$ ${total}`;

    subLabel.appendChild(subSpan);

    subLabel.appendChild(subSpan);
    propLabel.appendChild(propSpan);
    totLabel.appendChild(totSpan);

    // eliminar contenido previo
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv) {
        totalPagarDiv.remove();
    };
    
    divTotal.appendChild(subLabel);
    divTotal.appendChild(propLabel);
    divTotal.appendChild(totLabel);

    const formulario = document.querySelector('.formulario');

    formulario.appendChild(divTotal);


};

function eliminarPedido(id) {
    const {pedido} = cliente;
    const nuevoArreglo = pedido.filter(articulo => articulo.id !== id);
    // console.log('eliminando', id);
    cliente.pedido = [...nuevoArreglo];

    limpiarHtml();

    // si el arreglo de cliente.pedido tiene al menos un elemento, entonces llamamos a actualizar el resumen
    if(cliente.pedido.length) {
        // una vez cargados los pedidos y pasado todas las operaciones con los inputs
        // cargamos un resumen del pedido
        actualizarResumen();
    } else {
        // si esta vacio el arreglo del pedido entonces mostramos el mensaje cuando tiene que estar vacio
        limpiarContenidoVacio();
    };

    // aca identificamos el producto por un atributo que pusimos en el html
    const productoEliminado = `#producto-${id}`;

    // aca seleccionamos el input donde previamente les cargamos un id con el producto para luego ubicarnos en el y volver su valor a 0
    const inputEliminado = document.querySelector(productoEliminado);
    // console.log(productoEliminado);
    
    // asignamos el valor 0 al value del input que seleccionamos por su producto id
    inputEliminado.value = 0;

};

function calcularSubtotal(precio, cantidad) {
    return `$ ${precio * cantidad}`;
};

function limpiarContenidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);
};

