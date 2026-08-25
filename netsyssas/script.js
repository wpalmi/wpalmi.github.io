// 1. Cambiar estilo del Header al hacer scroll
window.addEventListener("scroll", function () {
  const header = document.getElementById("mainHeader");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
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
}

// 5. Ventana Flotante (Modal) de Servicios
function openServiceModal(imageSrc, title, description) {
  const modal = document.getElementById("serviceModal");
  document.getElementById("modalImg").src = imageSrc;
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalDescription").innerText = description;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeServiceModal(event) {
  if (event.target.id === "serviceModal") {
    closeServiceModalForce();
  }
}

function closeServiceModalForce() {
  const modal = document.getElementById("serviceModal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}
