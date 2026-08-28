// 1. Cambiar estilo del Header al hacer scroll
window.addEventListener("scroll", function () {
  const header = document.getElementById("mainHeader");
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
});

// 2. Animación Scroll Reveal para elementos con la clase .reveal
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  const windowHeight = window.innerHeight;

  reveals.forEach((reveal) => {
    const elementTop = reveal.getBoundingClientRect().top;
    const elementVisible = 100;

    if (elementTop < windowHeight - elementVisible) {
      reveal.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// 3. Contadores Numéricos Animados
let countersStarted = false;
function startCounters() {
  const counterSection = document.querySelector(".stats-section");
  if (!counterSection) return;

  const sectionPos = counterSection.getBoundingClientRect().top;
  const screenPos = window.innerHeight;

  if (sectionPos < screenPos && !countersStarted) {
    countersStarted = true;
    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      let count = 0;
      const speed = target / 50;

      const updateCount = () => {
        count += speed;
        if (count < target) {
          if (target === 100) {
            counter.innerText = Math.ceil(count) + "%";
          } else {
            counter.innerText = "+" + Math.ceil(count);
          }
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target === 100 ? target + "%" : "+" + target;
        }
      };
      updateCount();
    });
  }
}

window.addEventListener("scroll", startCounters);

// 4. Envío de Formulario EmailJS
function handleFormSubmit(e) {
  e.preventDefault();
  const formElement = document.getElementById("consultationForm");

  if (typeof emailjs !== "undefined") {
    emailjs.sendForm("service_7s9fe2g", "template_3godeq6", formElement).then(
      function () {
        alert("¡Gracias! Tu mensaje ha sido enviado exitosamente.");
        formElement.reset();
      },
      function (error) {
        alert("Ocurrió un error al enviar el mensaje. Inténtalo de nuevo.");
        console.error("Error EmailJS:", error);
      },
    );
  } else {
    alert("Error: El servicio de correo no se ha cargado correctamente.");
  }
}

// Exponer la función al scope global para que index.html la reconozca en onsubmit
window.handleFormSubmit = handleFormSubmit;

// 5. Ventana Flotante (Modal) de Servicios
window.openServiceModal = function (imageSrc, title, description) {
  const modal = document.getElementById("serviceModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDescription");

  if (!modal || !modalImg || !modalTitle || !modalDesc) return;

  modalImg.src = imageSrc;
  modalTitle.innerText = title;
  modalDesc.innerText = description;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeServiceModalForce = function () {
  const modal = document.getElementById("serviceModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
};

window.closeServiceModal = function (event) {
  if (event.target.classList.contains("modal-overlay")) {
    window.closeServiceModalForce();
  }
};

// 6. Lógica de Menú, FAQ y Filtros cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // --- Menú Hamburguesa ---
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  const icon = hamburgerBtn ? hamburgerBtn.querySelector("i") : null;

  if (hamburgerBtn && navLinks && icon) {
    hamburgerBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");

      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
      } else {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      });
    });
  }

  // --- Acordeón FAQ ---
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const faqItem = button.parentElement;
      const isActive = faqItem.classList.contains("active");

      document
        .querySelectorAll(".faq-item")
        .forEach((item) => item.classList.remove("active"));

      if (!isActive) {
        faqItem.classList.add("active");
      }
    });
  });

  // --- Filtro de Servicios ---
  const filterButtons = document.querySelectorAll(".filter-btn");
  const serviceCards = document.querySelectorAll(".service-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      serviceCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.classList.remove("hide");
        } else {
          card.classList.add("hide");
        }
      });
    });
  });
});

// Ocultar Preloader al Cargar la Página
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("hide");
    }, 1200);
  }
});
