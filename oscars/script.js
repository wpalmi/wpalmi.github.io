// CONFIGURACIÓN CENTRALIZADA DE CONTACTO Y TALLER
const TALLER_CONFIG = {
  nombre: "OSCARS Latonería y Pintura",
  eslogan: "Calidad que se nota",
  whatsappNumero: "573001234567",
  telefonoPrincipal: "+57 300 123 4567",
  telefonoSecundario: "+57 311 987 6543",
  direccion: "Calle 13 # 38 - 45, Zona Industrial / 7 de Agosto",
  ciudad: "(Bogotá / Colombia)",
  horarioSemana: "Lunes a Viernes: 7:30 AM - 5:30 PM",
  horarioSabado: "Sábados: 7:30 AM - 2:00 PM",
  mensajes: {
    header:
      "Hola OSCARS Latonería y Pintura, quisiera cotizar un trabajo de latonería o pintura.",
    hero: "Hola OSCARS Latonería y Pintura, me gustaría agendar una revisión de mi vehículo.",
    footer:
      "Hola OSCARS Latonería y Pintura, quisiera cotizar un trabajo para mi vehículo.",
    flotante: "Hola OSCARS Latonería y Pintura, necesito información.",
  },
};

function construirUrlWhatsApp(texto) {
  return `https://wa.me/${TALLER_CONFIG.whatsappNumero}?text=${encodeURIComponent(texto)}`;
}

// PRELOADER CON BARRA Y CIERRE SEGURO (~3.5 segundos)
const preloader = document.getElementById("preloader");
const preloaderBar = document.getElementById("preloaderBar");
let preloaderCerrado = false;

function ocultarPreloader() {
  if (preloaderCerrado) return;
  preloaderCerrado = true;
  if (preloaderBar) {
    preloaderBar.style.width = "100%";
  }
  setTimeout(() => {
    if (preloader) {
      preloader.classList.add("hidden");
    }
  }, 450);
}

if (preloaderBar) {
  setTimeout(() => {
    if (!preloaderCerrado) preloaderBar.style.width = "45%";
  }, 300);
  setTimeout(() => {
    if (!preloaderCerrado) preloaderBar.style.width = "78%";
  }, 1500);
}

window.addEventListener("load", () => {
  setTimeout(ocultarPreloader, 2600);
});
setTimeout(ocultarPreloader, 3500);

function inicializarDatosContacto() {
  const enlaces = [
    { id: "headerWappBtn", msg: TALLER_CONFIG.mensajes.header },
    { id: "heroWappBtn", msg: TALLER_CONFIG.mensajes.hero },
    { id: "footerWappBtn", msg: TALLER_CONFIG.mensajes.footer },
    { id: "floatWappBtn", msg: TALLER_CONFIG.mensajes.flotante },
  ];

  enlaces.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (el) {
      el.href = construirUrlWhatsApp(msg);
    }
  });

  document.querySelectorAll(".card-wapp-link").forEach((link) => {
    const tipo = link.getAttribute("data-vehiculo") || "vehículo";
    const msg = `Hola ${TALLER_CONFIG.nombre}, quisiera cotizar latonería o pintura para: ${tipo}.`;
    link.href = construirUrlWhatsApp(msg);
  });

  const textos = {
    tallerDireccion: TALLER_CONFIG.direccion,
    tallerTelefonoPrincipal: TALLER_CONFIG.telefonoPrincipal,
    tallerTelefonoSecundario: TALLER_CONFIG.telefonoSecundario,
    tallerHorarioSemana: TALLER_CONFIG.horarioSemana,
    tallerHorarioSabado: TALLER_CONFIG.horarioSabado,
  };

  Object.entries(textos).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = valor;
    }
  });

  const ciudadEl = document.getElementById("tallerCiudad");
  if (ciudadEl) {
    ciudadEl.innerHTML = `<small>${TALLER_CONFIG.ciudad}</small>`;
  }
}

// 1. Menú desplegable Móvil
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

// 2. Control del Slider Antes / Después (input, clic directo y teclado)
const baSlider = document.getElementById("baSlider");
const sliderHandle = document.getElementById("sliderHandle");
const imgBefore = document.querySelector(".img-before");
const sliderLine = document.getElementById("sliderLine");

function actualizarSlider(porcentaje) {
  const val = Math.max(0, Math.min(100, Number(porcentaje)));
  if (sliderHandle) sliderHandle.value = val;
  if (imgBefore) imgBefore.style.width = `${val}%`;
  if (sliderLine) sliderLine.style.left = `${val}%`;
}

if (sliderHandle) {
  sliderHandle.addEventListener("input", (e) => {
    actualizarSlider(e.target.value);
  });
}

if (baSlider) {
  baSlider.addEventListener("click", (e) => {
    const rect = baSlider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const porcentaje = (x / rect.width) * 100;
    actualizarSlider(porcentaje);
  });
}

// 3. Filtros Interactivos de Galería
const filterBtns = document.querySelectorAll(".filter-btn");
const galeriaItems = document.querySelectorAll(".galeria-item");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filterValue = btn.getAttribute("data-filter");

    galeriaItems.forEach((item) => {
      if (filterValue === "todos" || item.classList.contains(filterValue)) {
        item.classList.remove("hide");
      } else {
        item.classList.add("hide");
      }
    });
  });
});

// 4. Progreso de Scroll, Enlace Activo y Revelado de Elementos
const scrollProgress = document.getElementById("scrollProgress");
const seccionesNav = document.querySelectorAll("section[id]");
const linksNav = document.querySelectorAll(".nav-links a");

function actualizarScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress && docHeight > 0) {
    const progreso = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    scrollProgress.style.width = `${progreso}%`;
  }

  let seccionActiva = "hero";
  seccionesNav.forEach((sec) => {
    const top = sec.offsetTop - 130;
    if (scrollTop >= top) {
      seccionActiva = sec.getAttribute("id");
    }
  });

  linksNav.forEach((a) => {
    const href = a.getAttribute("href") || "";
    a.classList.toggle("active", href === `#${seccionActiva}`);
  });

  const reveals = document.querySelectorAll(".reveal");
  const windowHeight = window.innerHeight;

  reveals.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 100;

    if (elementTop < windowHeight - elementVisible) {
      element.classList.add("active");
    }
  });
}

window.addEventListener("scroll", actualizarScrollUI);
window.addEventListener("load", () => {
  inicializarDatosContacto();
  actualizarScrollUI();
});

// 5. Lógica de la Galería Flotante (Lightbox)
const modal = document.getElementById("modalLightbox");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalWappBtn = document.getElementById("modalWappBtn");
const modalClose = document.getElementById("modalClose");

function cerrarModalLightbox() {
  if (modal) {
    modal.classList.remove("active");
  }
}

if (
  modal &&
  modalImg &&
  modalTitle &&
  modalDesc &&
  modalWappBtn &&
  modalClose
) {
  document.querySelectorAll(".galeria-item").forEach((item) => {
    item.addEventListener("click", () => {
      const fullImg = item.getAttribute("data-full");
      const title = item.getAttribute("data-title");
      const desc = item.getAttribute("data-desc");

      modalImg.src = fullImg;
      modalTitle.textContent = title;
      modalDesc.textContent = desc;

      const wappMessage = `Hola ${TALLER_CONFIG.nombre}, vi la foto de ${title} en la galería y quisiera cotizar un trabajo similar para mi vehículo.`;
      modalWappBtn.href = construirUrlWhatsApp(wappMessage);

      modal.classList.add("active");
    });
  });

  modalClose.addEventListener("click", cerrarModalLightbox);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      cerrarModalLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      cerrarModalLightbox();
    }
  });
}
