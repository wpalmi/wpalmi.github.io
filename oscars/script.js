// 1. Menú desplegable Móvil
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// 2. Control del Slider Antes / Después
const sliderHandle = document.getElementById("sliderHandle");
const imgBefore = document.querySelector(".img-before");
const sliderLine = document.getElementById("sliderLine");

if (sliderHandle) {
  sliderHandle.addEventListener("input", (e) => {
    const val = e.target.value;
    imgBefore.style.width = `${val}%`;
    sliderLine.style.left = `${val}%`;
  });
}

// 3. Filtros Interactivos de Galería
const filterBtns = document.querySelectorAll(".filter-btn");
const galeriaItems = document.querySelectorAll(".galeria-item");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Cambiar botón activo
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filterValue = btn.getAttribute("data-filter");

    // Filtrar elementos
    galeriaItems.forEach((item) => {
      if (filterValue === "todos" || item.classList.contains(filterValue)) {
        item.classList.remove("hide");
      } else {
        item.classList.add("hide");
      }
    });
  });
});

// 4. Animación de Aparición al hacer Scroll (Scroll Reveal)
function revealOnScroll() {
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

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// 5. Lógica de la Galería Flotante (Lightbox)
const modal = document.getElementById('modalLightbox');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalWappBtn = document.getElementById('modalWappBtn');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.galeria-item').forEach(item => {
  item.addEventListener('click', () => {
    const fullImg = item.getAttribute('data-full');
    const title = item.getAttribute('data-title');
    const desc = item.getAttribute('data-desc');

    modalImg.src = fullImg;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    
    // Configura el botón de WhatsApp para cotizar ese carro específico
    const wappMessage = encodeURIComponent(`Hola OsCars, vi la foto de ${title} en la galería y quisiera cotizar un trabajo similar para mi vehículo.`);
    modalWappBtn.href = `https://wa.me/573001234567?text=${wappMessage}`;

    modal.classList.add('active');
  });
});

// Cerrar modal al hacer clic en la X o fuera del contenido
modalClose.addEventListener('click', () => modal.classList.remove('active'));

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});