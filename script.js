const chat = document.getElementById("chat");
let currentStep = null;
let nitTemporal = "";
const negociosRegistrados = [
  "900123456",
  "800555333",
  "123456789"
];
let datosRegistroTemporal = {};

function getTime() {
  const now = new Date();
  return now.getHours() + ":" + now.getMinutes().toString().padStart(2, '0');
}

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.classList.add("message", sender);

  let checks = "";
  if (sender === "user") {
    checks = `<span class="checks">✔✔</span>`;
  }

  message.innerHTML = `
    <div class="text">${text}</div>
    <div class="meta">
      <span class="time">${getTime()}</span>
      ${checks}
    </div>
  `;

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping(callback) {
  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.id = "typing";
  typing.innerHTML = "Escribiendo...";
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    typing.remove();
    callback();
  }, 1500);
}

function startDemo() {

  // 1️⃣ Mensaje automático del usuario
  setTimeout(() => {

    addMessage(
      "Holaaa, quiero hacer parte del Festival del Perro Caliente Zenú 🙋🏻‍♂️",
      "user"
    );

    // 2️⃣ Simulación escribiendo
    showTyping(() => {

      // 3️⃣ Mensaje del bot (todo en uno con salto de línea)
      addMessage(
        "¡Bienvenido! 🌭 Estamos buscando al Titular del Sabor y tu perro caliente puede ser el convocado.\n\n¿Qué jugada vas a hacer hoy?",
        "bot"
      );

      // 4️⃣ Mostrar opciones después de pequeño delay
      setTimeout(() => {

        const options = document.createElement("div");
        options.classList.add("options");

        options.innerHTML = `
          <button onclick="selectOption('Registrar mi primera factura')">
            Registrar mi primera factura
          </button>
          <button onclick="selectOption('Sumar más facturas a mi acumulado')">
            Sumar más facturas a mi acumulado
          </button>
        `;

        chat.appendChild(options);
        chat.scrollTop = chat.scrollHeight;

      }, 800);

    });

  }, 800);
}

function selectOption(option) {

  // 1️⃣ Eliminar el ÚLTIMO bloque de opciones (no el primero que encuentre)
  const optionsBlocks = document.querySelectorAll(".options");
  if (optionsBlocks.length > 0) {
    optionsBlocks[optionsBlocks.length - 1].remove();
  }

  // 2️⃣ Mostrar lo que eligió el usuario
  addMessage(option, "user");

  // 3️⃣ Simular typing y continuar flujo
  showTyping(() => {

    if (option === "Registrar mi primera factura") {
      flowPrimeraFactura();
    }

    if (option === "Sumar más facturas a mi acumulado") {
      flowSumarFacturas();
    }

  });
}

function flowPrimeraFactura() {

  currentStep = "esperando_terminos";

  addMessage(
    "Antes de registrar tu factura debes aceptar nuestros Términos y Condiciones.\n\nPuedes consultarlos aquí:\n🔗 https://tusitio.com/terminos.pdf\n\n¿Aceptas los términos y condiciones?",
    "bot"
  );

  setTimeout(() => {

  const options = document.createElement("div");
  options.classList.add("options");

  options.innerHTML = `
    <button onclick="handleTerminos('aceptar')">
      Aceptar
    </button>
    <button onclick="handleTerminos('rechazar')">
      No aceptar
    </button>
  `;

  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;

  }, 800);
}

function handleTerminos(respuesta) {

  // Eliminar último bloque de opciones
  const optionsBlocks = document.querySelectorAll(".options");
  if (optionsBlocks.length > 0) {
    optionsBlocks[optionsBlocks.length - 1].remove();
  }

  if (respuesta === "aceptar") {

    addMessage("Acepto los términos y condiciones", "user");

    showTyping(() => {

      currentStep = "esperando_nit";

      addMessage(
        "¿Cuál es el <strong>NIT de tu negocio o cédula</strong>? (Ingresa el NIT sin el último dígito de verificación) 📄",
        "bot"
      );

    });

  } else {

    addMessage("No acepto los términos y condiciones", "user");

    showTyping(() => {

      addMessage(
        "Es necesario que aceptes los términos y condiciones para continuar.",
        "bot"
      );

      mostrarBotonSoloAceptar();

    });

  }
}

function mostrarBotonSoloAceptar() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btnAceptar = document.createElement("button");
  btnAceptar.textContent = "Aceptar";
  btnAceptar.onclick = () => handleTerminos("aceptar");

  options.appendChild(btnAceptar);

  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function sendMessage() {

  const input = document.getElementById("userInput");
  const text = input.value.trim();

  if (text === "") return;

  addMessage(text, "user");
  input.value = "";

  manejarFlujo(text);
}

function manejarFlujo(textoUsuario) {
  // 🏢 Esperando NIT (primer registro o sumar facturas)
  if (currentStep === "esperando_nit" || currentStep === "esperando_nit_sumar") {

    // Validar que solo sean números
    const soloNumeros = /^[0-9]+$/.test(textoUsuario);
    if (!soloNumeros) {
      showTyping(() => {
        addMessage(
          "Por favor ingresa solo números, sin puntos ni guiones.",
          "bot"
        );
      });
      return;
    }

    // Guardamos el NIT temporalmente
    nitTemporal = textoUsuario;

    showTyping(() => {
      currentStep = "confirmando_nit";
      addMessage(
        `Confirma tu NIT o cédula:\n\n<strong>${nitTemporal}</strong>\n\n¿Es correcto?`,
        "bot"
      );
      mostrarOpcionesConfirmacionNit();
    });

    return;
  }

  // Evitar que vuelva a pedir NIT si ya está confirmado en flujo de sumar facturas
  if (currentStep === "sumar_facturas_lista") {
    // Aquí podemos manejar inputs de facturas o simplemente ignorarlos
    return;
  }

    // 🆘 Esperando mensaje para asesor
  if (currentStep === "esperando_mensaje_asesor") {

    const mensajeUsuario = textoUsuario;

    showTyping(() => {
      addMessage(
        `Gracias por escribirnos 🙌✨  

  Recibimos tu mensaje y nuestro equipo lo estará revisando con prioridad.  

  Muy pronto uno de nuestros asesores se pondrá en contacto contigo para ayudarte. 💬🌭  

  ¡Gracias por seguir jugando con toda la actitud!`,
        "bot"
      );

      // 🔥 Importante: cerrar el estado
      currentStep = null;
    });

    return;
  }
}

function mostrarOpcionesConfirmacionNit() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btnCorrecto = document.createElement("button");
  btnCorrecto.textContent = "Correcto";
  btnCorrecto.onclick = () => confirmarNit(true);

  const btnCorregir = document.createElement("button");
  btnCorregir.textContent = "Corregir";
  btnCorregir.onclick = () => confirmarNit(false);

  options.appendChild(btnCorrecto);
  options.appendChild(btnCorregir);

  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function confirmarNit(esCorrecto) {
  // Eliminar último bloque de opciones
  const optionsBlocks = document.querySelectorAll(".options");
  if (optionsBlocks.length > 0) {
    optionsBlocks[optionsBlocks.length - 1].remove();
  }

  if (esCorrecto) {
    addMessage("Correcto", "user");

    showTyping(() => {
      const yaRegistrado = negociosRegistrados.includes(nitTemporal);

      if (yaRegistrado) {
        addMessage(
          "¡Tu negocio ya está registrado! 🎉\n\nTe invitamos a registrar más facturas; recuerda que entre mayor sea el valor acumulado de tus compras, ¡más posibilidades tienes de ser convocado! 🌭",
          "bot"
        );

        // Mostrar botón para sumar más facturas
        mostrarBotonSumarFacturas();

        // ⚡ CAMBIO CLAVE: marcamos que NIT ya confirmado
        currentStep = "sumar_facturas_lista";

      } else {
        addMessage(
          "¡Perfecto! Iniciemos el registro de tu negocio. 🏢",
          "bot"
        );
        mostrarBotonCompletarRegistro();
        currentStep = "registro_datos";
      }
    });

  } else {
    addMessage("Corregir NIT", "user");
    showTyping(() => {
      currentStep = (currentStep === "esperando_nit_sumar") 
        ? "esperando_nit_sumar" 
        : "esperando_nit";
      addMessage("Por favor ingresa nuevamente el NIT de tu negocio 📄", "bot");
    });
  }
}

function mostrarBotonCompletarRegistro() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btn = document.createElement("button");
  btn.textContent = "Completar aquí";
  btn.onclick = () => {
    options.remove(); // elimina botón
    mostrarFormularioRegistro();
  };

  options.appendChild(btn);
  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function guardarRegistro() {

  const razon = document.getElementById("razonSocial").value;
  const responsable = document.getElementById("responsable").value;
  const ciudad = document.getElementById("ciudad").value;
  const direccion = document.getElementById("direccion").value;
  const cedula = document.getElementById("cedula").value;

  if (!razon || !responsable || !ciudad || !direccion || !cedula) {
    alert("Completa todos los campos");
    return;
  }

  // Guardamos temporalmente
  datosRegistroTemporal = {
    razon,
    responsable,
    ciudad,
    direccion,
    cedula
  };

  // Cerrar modal
  document.getElementById("registroModal").style.display = "none";

  // ✅ 1. Mostrar tarjeta tipo archivo (mensaje usuario)
  const fileMessage = document.createElement("div");
  fileMessage.classList.add("message", "user", "file-message");

  fileMessage.innerHTML = `
    <div class="file-box">
      <div class="file-icon">📄</div>
      <div>
        <strong>Completar aquí</strong><br>
        <small>Respuesta enviada</small>
      </div>
    </div>
  `;

  chat.appendChild(fileMessage);
  chat.scrollTop = chat.scrollHeight;

  // ✅ 2. Luego mostrar confirmación del bot
  setTimeout(() => {
    mostrarConfirmacionDatos();
  }, 800);
}

function mostrarFormularioRegistro() {
  document.getElementById("registroModal").style.display = "flex";
}

function mostrarConfirmacionDatos() {

  const d = datosRegistroTemporal;

  addMessage(
`Confirma los datos del negocio:

🏢 Razón social: ${d.razon}
👤 Responsable: ${d.responsable}
🏙️ Ciudad: ${d.ciudad}
📍 Dirección: ${d.direccion}
🆔 Cédula: ${d.cedula}`,
  "bot"
  );

  mostrarBotonesConfirmacion();
}

function mostrarBotonesConfirmacion() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btnConfirmar = document.createElement("button");
  btnConfirmar.textContent = "Confirmar registro";
  btnConfirmar.onclick = () => confirmarRegistroFinal(options);

  const btnCorregir = document.createElement("button");
  btnCorregir.textContent = "Corregir datos";
  btnCorregir.onclick = () => corregirDatos(options);

  options.appendChild(btnConfirmar);
  options.appendChild(btnCorregir);

  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function confirmarRegistroFinal(optionsBlock) {

  optionsBlock.remove();

  addMessage("Confirmar registro", "user");

  showTyping(() => {

    mostrarMensajeFestival();

  });
}

function mostrarMensajeFestival() {

  addMessage(
`🎉 ¡Tu negocio se ha registrado para participar por un cupo en el Festival del Perro Caliente Zenú 2026!

<img src="tulio.jpg" style="width:100%; max-width:280px; border-radius:16px; margin:10px 0;" />

Ahora es tu turno de registrar todas tus facturas de compra con productos Zenú si quieres ser uno de los 200 negocios participantes. 🌭

¡Entre mayor sea el valor acumulado de tus compras registradas, más posibilidades tendrás de hacer parte del festival! 🎊

Por favor selecciona la opción para continuar:`,
  "bot"
  );

  mostrarBotonFactura();
}

function mostrarBotonFactura() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btnFactura = document.createElement("button");
  btnFactura.textContent = "🧾 Registrar tu factura subiendo la foto";

  btnFactura.onclick = () => {

    options.remove();

    addMessage("🧾 Registrar tu factura subiendo la foto", "user");

    showTyping(() => {

      addMessage("Por favor sube una foto de tu factura de compra Zenú donde se vean claramente los nombres de los productos 📸", "bot");

      setTimeout(() => {
        simularSubidaFactura();
      }, 1000);

    });
  };

  options.appendChild(btnFactura);
  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function simularSubidaFactura() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btnSubir = document.createElement("button");
  btnSubir.textContent = "📎 Subir imagen";

  btnSubir.onclick = () => {

    options.remove();

    // Mensaje usuario simulando foto subida
    const fotoMessage = document.createElement("div");
    fotoMessage.classList.add("message", "user");

    fotoMessage.innerHTML = `
      <div class="file-box">
        <div class="file-icon">📸</div>
        <div>
          <strong>Foto subida</strong><br>
          <small>Imagen enviada</small>
        </div>
      </div>
    `;

    chat.appendChild(fotoMessage);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      showTyping(() => {
        addMessage("¡Factura registrada correctamente!✅\n\n ¿Deseas registrar otra factura? 📷", "bot");
        mostrarOpcionesPostFactura();
      });
    }, 800);

  };

  options.appendChild(btnSubir);
  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarOpcionesPostFactura() {

  const options = document.createElement("div");
  options.classList.add("options");

  // Botón registrar otra
  const btnOtra = document.createElement("button");
  btnOtra.textContent = "🧾 Registrar tu factura subiendo la foto";

  btnOtra.onclick = () => {
    options.remove();
    addMessage("🧾 Registrar tu factura subiendo la foto", "user");

    setTimeout(() => {
      simularSubidaFactura();
    }, 500);
  };

  // Botón finalizar
  const btnFinalizar = document.createElement("button");
  btnFinalizar.textContent = "Finalizar";

  btnFinalizar.onclick = () => {
    options.remove();
    addMessage("Finalizar", "user");

    setTimeout(() => {
      showTyping(() => {
        addMessage(
`¡Buen pase! Gracias por participar. 🎉

Recuerda que puedes volver a este chat en cualquier momento para registrar más facturas. Tienes hasta el <strong>30 de abril de 2026</strong>.

Sigue sumando, porque con un mayor valor acumulado, estás más cerca de ser parte de la titular del sabor.

Te avisaremos por aquí cuando termine el tiempo reglamentario de inscripción. 🌭🏆`,
        "bot"
        );
      });
    }, 800);
  };

  options.appendChild(btnOtra);
  options.appendChild(btnFinalizar);

  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarBotonSubirImagen() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btnSubir = document.createElement("button");
  btnSubir.textContent = "📎 Subir imagen";

  btnSubir.onclick = () => {
    document.getElementById("inputFactura").click();
  };

  options.appendChild(btnSubir);
  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function corregirDatos(optionsBlock) {

  optionsBlock.remove();

  addMessage("Corregir datos", "user");

  // Reabrir modal con datos ya cargados
  document.getElementById("razonSocial").value = datosRegistroTemporal.razon;
  document.getElementById("responsable").value = datosRegistroTemporal.responsable;
  document.getElementById("ciudad").value = datosRegistroTemporal.ciudad;
  document.getElementById("direccion").value = datosRegistroTemporal.direccion;
  document.getElementById("cedula").value = datosRegistroTemporal.cedula;

  document.getElementById("registroModal").style.display = "flex";
}



function mostrarBotonSumarFacturas() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btn = document.createElement("button");
  btn.textContent = "Sumar más facturas a mi acumulado";
  btn.onclick = () => flowSumarFacturas();

  options.appendChild(btn);

  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function flowSumarFacturas() {
  // ⚡ Si ya tenemos NIT confirmado, vamos directo a registrar facturas
  if (currentStep === "sumar_facturas_lista") {
    showTyping(() => {
      addMessage(
        "Por favor sube una foto de tu factura de compra Zenú donde se vean claramente los productos 📸",
        "bot"
      );
      simularSubidaFactura();
    });
    return;
  }

  // Si NO está confirmado, pedimos NIT
  const options = document.querySelector(".options");
  if (options) options.remove();

  setTimeout(() => {
    showTyping(() => {
      addMessage(
        "Por favor ingresa el NIT del negocio (sin el último dígito de verificación) 📄",
        "bot"
      );
      currentStep = "esperando_nit_sumar";
    });
  }, 500);
}

function confirmarNit(esCorrecto) {
  // Eliminar último bloque de opciones
  const optionsBlocks = document.querySelectorAll(".options");
  if (optionsBlocks.length > 0) optionsBlocks[optionsBlocks.length - 1].remove();

  if (esCorrecto) {
    addMessage("Correcto", "user");

    showTyping(() => {
      const yaRegistrado = negociosRegistrados.includes(nitTemporal);

      if (yaRegistrado) {
        addMessage(
          "¡Tu negocio ya está registrado! 🎉\n\nTe invitamos a registrar más facturas; recuerda que entre mayor sea el valor acumulado de tus compras, ¡más posibilidades tienes de ser convocado! 🌭",
          "bot"
        );

        // ⚡ Marcamos que el NIT ya está confirmado
        currentStep = "sumar_facturas_lista";

        // ⚡ Vamos directo a registrar facturas
        mostrarBotonFactura();

      } else {
        addMessage(
          "¡Perfecto! Iniciemos el registro de tu negocio. 🏢",
          "bot"
        );
        mostrarBotonCompletarRegistro();
        currentStep = "registro_datos";
      }
    });

  } else {
    addMessage("Corregir NIT", "user");
    showTyping(() => {
      currentStep = (currentStep === "esperando_nit_sumar") 
        ? "esperando_nit_sumar" 
        : "esperando_nit";
      addMessage("Por favor ingresa nuevamente el NIT de tu negocio 📄", "bot");
    });
  }
}

function mostrarSelectorFlujo() {
  const selector = document.createElement("div");
  selector.classList.add("options");

  selector.innerHTML = `
    <button onclick="iniciarFlujoDemo('general', this)">Flujo general</button>
    <button onclick="iniciarFlujoDemo('ganador', this)">Flujo ganador</button>
    <button onclick="iniciarFlujoDemo('perdedor', this)">Flujo perdedor</button>
  `;

  chat.appendChild(selector);
  chat.scrollTop = chat.scrollHeight;
}

function iniciarFlujoDemo(flujo, boton) {
  // Quitar el selector
  boton.parentElement.remove();

  if (flujo === "general") {
    // ⚡ Aquí usamos tu flujo normal sin tocar nada
    startDemo();
  } 
  else if (flujo === "ganador") {
    // Llamamos al flujo ganador completo
    flujoGanador();
  } 
  else if (flujo === "perdedor") {
    showTyping(() => {
      addMessage(
        `¡Pegó en el palo! 😮‍💨

Esta vez no lograste entrar a la nómina del Festival del Perro Caliente Zenú, La Titular del Sabor.

¡Pero el partido no termina aquí! Valoramos tu talento y queremos darle visibilidad a tu negocio compartiendo tus contenidos en nuestras redes (vía repost o collab).

Solo asegúrete de cumplir estos mínimos de producción:

• Calidad visual: vídeos o fotos en alta calidad, bien enfocados y con buena iluminación.
• Presentación: que el producto se ve impecable y súper provocativo (cuida el fondo y los detalles).
• Etiquetamos: etiqueta siempre a @zenuoficial

¡Gracias por darla toda en la cancha! 🌭🤝`,
        "bot"
      );
    });
  }
}

//GANADOR

function flujoGanador() {

  showTyping(() => {
    addMessage(
`¡Golaaaaazo!⚽

El registro de todas tus facturas fue la mejor jugada que pudiste hacer. 💪

Has sido seleccionado para ser parte del Festival del Perro Caliente Zenú 2026, La Titular del Sabor. 🌭

Ahora con la ayuda de tus hinchas participarás por ser uno de los 9 ganadores de diferentes premios.

Para completar tu registro 📸 por favor sube aquí una foto donde aparezcas tú al lado de tu local (fachada o interior). 

Asegúrete de que sea cerca y tenga buena resolución para que tú y tu negocio se vean de primera división. ⭐`,
      "bot"
    );

    setTimeout(() => {
      mostrarBotonSubirImagenGanador();
    }, 800);
  });
}

function mostrarBotonSubirImagenGanador() {

  const options = document.createElement("div");
  options.classList.add("options");

  const btnSubir = document.createElement("button");
  btnSubir.textContent = "📎 Subir foto";

  btnSubir.onclick = () => {
    options.remove();

    // Mensaje usuario simulando foto subida
    const fotoMessage = document.createElement("div");
    fotoMessage.classList.add("message", "user");

    fotoMessage.innerHTML = `
      <div class="file-box">
        <div class="file-icon">📸</div>
        <div>
          <strong>Foto subida</strong><br>
          <small>Imagen enviada</small>
        </div>
      </div>
    `;

    chat.appendChild(fotoMessage);
    chat.scrollTop = chat.scrollHeight;

    // Mensaje de confirmación del bot
    setTimeout(() => {
      showTyping(() => {
        addMessage(
`¡Foto recibida! ✅

Ahora, necesitamos que revises tus datos. A esta dirección te enviaremos la táctica del juego (instrucciones) y el kit oficial para que vistas tu local con toda la actitud del festival:

📍 Dirección: prueba
📱 Número de contacto: prueba`,
          "bot"
        );

        setTimeout(() => {
          mostrarBotonesConfirmacionGanador();
        }, 500);
      });
    }, 800);
  };

  options.appendChild(btnSubir);
  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarBotonesConfirmacionGanador() {
  const options = document.createElement("div");
  options.classList.add("options");

  const btnConfirmar = document.createElement("button");
  btnConfirmar.textContent = "Confirmar datos";
  btnConfirmar.onclick = () => {
    options.remove();
    addMessage("Confirmar datos", "user");
    showTyping(() => {
      addMessage(
        `¡Fichaje confirmado! 🎉📝
          Prepárate para vestir tu local: haremos los envíos de tu material entre el 1 y el 14 de mayo.📦

          Una vez los recibas, será tu turno de crear la mejor táctica para que tus hinchas voten por ti y te conviertan en uno de los 9 campeones.

          ¡Mucha suerte en el festival! 🌭⚽`,
        "bot"
      );
    });
  };

  const btnCorregir = document.createElement("button");
  btnCorregir.textContent = "Corregir datos";
  btnCorregir.onclick = () => {
    options.remove();
    addMessage("Corregir datos", "user");
    mostrarFormularioCorreccionGanador();
  };

  options.appendChild(btnConfirmar);
  options.appendChild(btnCorregir);
  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}

// Función específica para corregir solo dirección y contacto en el flujo ganador
function mostrarFormularioCorreccionGanador() {
  const correccionDiv = document.createElement("div");
  correccionDiv.classList.add("modal"); 

  // Estilos inline para que se vea
  correccionDiv.style.display = "flex";
  correccionDiv.style.justifyContent = "center";
  correccionDiv.style.alignItems = "center";
  correccionDiv.style.position = "fixed";
  correccionDiv.style.top = "0";
  correccionDiv.style.left = "0";
  correccionDiv.style.width = "100%";
  correccionDiv.style.height = "100%";
  correccionDiv.style.backgroundColor = "rgba(0,0,0,0.5)";
  correccionDiv.style.zIndex = "1000";

  correccionDiv.innerHTML = `
    <div class="modal-content" style="display:flex; flex-direction:column; gap:10px; padding:20px; border-radius:12px; width:300px;">
      <h3>Corregir datos</h3>
      <input type="text" id="direccionGanador" placeholder="Dirección" value="prueba">
      <input type="text" id="contactoGanador" placeholder="Número de contacto" value="prueba">
      <button id="guardarCorreccionGanador">Guardar</button>
    </div>
  `;

  document.body.appendChild(correccionDiv);

  document.getElementById("guardarCorreccionGanador").onclick = () => {
    const direccion = document.getElementById("direccionGanador").value.trim();
    const contacto = document.getElementById("contactoGanador").value.trim();

    if (!direccion || !contacto) {
      alert("Completa ambos campos");
      return;
    }

    // Cerramos el modal
    correccionDiv.remove();

    // Mensaje del bot confirmando la corrección
    showTyping(() => {
      addMessage(
        `Datos actualizados correctamente:\n📍 Dirección: ${direccion}\n📱 Número de contacto: ${contacto}`,
        "bot"
      );

      // Luego mostramos los dos botones
      setTimeout(() => {
        mostrarBotonesDespuesCorreccion();
      }, 500);
    });
  };
}

// Mostramos los dos botones después de corregir
function mostrarBotonesDespuesCorreccion() {
  const options = document.createElement("div");
  options.classList.add("options");

  const btnConfirmar = document.createElement("button");
  btnConfirmar.textContent = "✅ Confirmar corrección";
  btnConfirmar.onclick = () => {
    options.remove();
    addMessage("✅ Confirmar corrección", "user");

    showTyping(() => {
      addMessage("¡Corrección confirmada! 🎉", "bot");
    });
  };

  const btnAsesor = document.createElement("button");
  btnAsesor.textContent = "🙋‍♂️ Pedir asistencia";

  btnAsesor.onclick = () => {
    options.remove();
    addMessage("🙋‍♂️ Pedir asistencia", "user");

    showTyping(() => {
      addMessage("Por favor escribe tu mensaje y nuestro asesor lo revisará. 💬", "bot");
      currentStep = "esperando_mensaje_asesor"; // 🔥 activamos estado
    });
  };

  options.appendChild(btnConfirmar);
  options.appendChild(btnAsesor);
  chat.appendChild(options);
  chat.scrollTop = chat.scrollHeight;
}




// Se ejecuta apenas carga la página
window.onload = mostrarSelectorFlujo;

document.getElementById("userInput").addEventListener("keydown", function(event) {
  
  if (event.key === "Enter") {
    event.preventDefault();   // evita comportamiento raro
    sendMessage();            // llama tu función de enviar
  }

});

window.mostrarFormularioRegistro = function () {
  const modal = document.getElementById("registroModal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("No existe el modal en el HTML");
  }
};

document.getElementById("inputFactura").addEventListener("change", function(event) {

  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {

    // Eliminar botones
    const options = document.querySelector(".options");
    if (options) options.remove();

    // Mostrar imagen en el chat como mensaje usuario
    const imgMessage = document.createElement("div");
    imgMessage.classList.add("message", "user");

    const img = document.createElement("img");
    img.src = e.target.result;
    img.style.maxWidth = "200px";
    img.style.borderRadius = "12px";

    imgMessage.appendChild(img);
    chat.appendChild(imgMessage);

    chat.scrollTop = chat.scrollHeight;

    // Respuesta del bot
    setTimeout(() => {
      showTyping(() => {
        addMessage("✅ Factura recibida correctamente.\nEstamos validando la información...", "bot");
      });
    }, 800);
  };

  reader.readAsDataURL(file);
});

document.getElementById("inputFotoGanador").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    // eliminar botones
    const options = document.querySelector(".options");
    if (options) options.remove();

    // mostrar imagen en el chat
    const imgMessage = document.createElement("div");
    imgMessage.classList.add("message", "user");

    const img = document.createElement("img");
    img.src = e.target.result;
    img.style.maxWidth = "200px";
    img.style.borderRadius = "12px";

    imgMessage.appendChild(img);
    chat.appendChild(imgMessage);
    chat.scrollTop = chat.scrollHeight;

    // mensaje de confirmación del bot
    setTimeout(() => {
      showTyping(() => {
        addMessage(
`¡Foto recibida! ✅

Ahora, necesitamos que revises tus datos. A esta dirección te enviaremos la táctica del juego (instrucciones) y el kit oficial para que vistas tu local con toda la actitud del festival:

📍 Dirección: prueba
📱 Número de contacto: prueba`,
        "bot"
        );

        setTimeout(() => {
          mostrarBotonesConfirmacionGanador();
        }, 500);
      });
    }, 800);
  };

  reader.readAsDataURL(file);
});

document.getElementById("btnVolverMenuHeader").addEventListener("click", () => {
  document.querySelectorAll(".options").forEach(opt => opt.remove());
  document.querySelectorAll(".modal").forEach(modal => modal.style.display = "none");
  mostrarSelectorFlujo();
  showTyping(() => {
    addMessage("🏠 Has vuelto al menú principal.", "bot");
  });
});