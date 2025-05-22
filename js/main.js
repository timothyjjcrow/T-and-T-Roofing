// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize AOS animation library
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
    mirror: false,
  });

  // Sticky Header and Hide on Scroll Down / Show on Scroll Up
  const header = document.querySelector(".header");
  let lastScrollTop = 0;
  let scrolling = false;

  window.addEventListener("scroll", function () {
    scrolling = true;
  });

  // Check if page is scrolled and update header accordingly
  setInterval(function () {
    if (scrolling) {
      checkHeaderPosition();
      scrolling = false;
    }
  }, 100);

  function checkHeaderPosition() {
    const currentScroll = window.scrollY;

    // Make header sticky when scrolled down
    if (currentScroll > 50) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }

    // Hide on scroll down, show on scroll up
    if (currentScroll > lastScrollTop && currentScroll > 200) {
      // Scrolling down - hide header
      header.style.transform = "translateY(-100%)";
    } else {
      // Scrolling up - show header
      header.style.transform = "translateY(0)";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
  }

  // Mobile Menu Toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      menuToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking on a nav link
  const navLinks = document.querySelectorAll(".nav-menu a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Update active menu item based on scroll position
  function updateActiveMenuItem() {
    const sections = document.querySelectorAll("section");
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (sectionId) {
        const menuItem = document.querySelector(
          `.nav-menu a[href="#${sectionId}"]`
        );

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          navLinks.forEach((link) => link.classList.remove("active"));
          menuItem?.classList.add("active");
        }
      }
    });
  }

  window.addEventListener("scroll", updateActiveMenuItem);
  updateActiveMenuItem();

  // Carousel Functionality
  const carouselTrack = document.querySelector(".carousel-track");
  const carouselItems = document.querySelectorAll(".carousel-item");
  const prevButton = document.querySelector(".carousel-button.prev");
  const nextButton = document.querySelector(".carousel-button.next");
  const indicators = document.querySelector(".carousel-indicators");
  const categoryButtons = document.querySelectorAll(".category-btn");

  let currentIndex = 0;
  let itemWidth = 0;
  let slidesToShow = 3; // Show 3 slides at once with center focused
  let filteredItems = [...carouselItems];

  // Initialize carousel
  function initCarousel() {
    // Only proceed if all required elements exist
    if (!carouselTrack || !carouselItems.length || !indicators) {
      console.warn("Carousel elements not found");
      return;
    }

    // Standardize carousel images when the page loads
    standardizeCarouselImages();

    // Create indicators
    carouselItems.forEach((_, index) => {
      const indicator = document.createElement("div");
      indicator.classList.add("carousel-indicator");
      if (index === 0) indicator.classList.add("active");

      indicator.addEventListener("click", () => {
        goToSlide(index);
      });

      indicators.appendChild(indicator);
    });

    // Set up initial state
    updateCarousel();

    // Center the carousel on page load
    setTimeout(() => {
      goToSlide(Math.floor(filteredItems.length / 2)); // Start with a middle item
    }, 100);

    // Add event listeners only if elements exist
    if (prevButton) {
      prevButton.addEventListener("click", prevSlide);
    }

    if (nextButton) {
      nextButton.addEventListener("click", nextSlide);
    }

    // Category filter functionality
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        categoryButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        button.classList.add("active");

        // Filter items
        const category = button.getAttribute("data-category");
        filterItems(category);
      });
    });

    // Auto play (optional)
    setInterval(nextSlide, 6000);

    // Handle resize
    window.addEventListener("resize", () => {
      updateCarousel();
      goToSlide(currentIndex);
    });

    // Add keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    });
  }

  // Function to standardize carousel images
  function standardizeCarouselImages() {
    carouselItems.forEach((item) => {
      const image = item.querySelector(".carousel-image img");

      if (image) {
        // Add load event listener to handle images after they're loaded
        image.addEventListener("load", function () {
          // Ensure parent container maintains aspect ratio
          const container = this.closest(".carousel-image");
          if (container) {
            container.style.display = "flex";
            container.style.justifyContent = "center";
            container.style.alignItems = "center";
            container.style.overflow = "hidden";

            // Detect if image is tall or wide
            const imgRatio = this.naturalWidth / this.naturalHeight;
            const containerRatio =
              container.clientWidth / container.clientHeight;

            // For very tall images, ensure they're centered horizontally
            if (imgRatio < 0.75) {
              // If image is taller than it is wide
              this.style.objectPosition = "center center";
            }
            // For wide images, ensure they're centered vertically
            else if (imgRatio > 1.5) {
              this.style.objectPosition = "center center";
            }
          }
        });

        // Force reload of images to trigger load event
        if (image.complete) {
          const src = image.src;
          image.src = "";
          setTimeout(() => {
            image.src = src;
          }, 10);
        }
      }
    });
  }

  // Update carousel dimensions
  function updateCarousel() {
    const carouselContainer = document.querySelector(".carousel-container");
    if (!carouselContainer) return;

    // Set item width based on viewport and slides to show
    if (window.innerWidth < 768) {
      // Mobile: show one slide at 90% width
      itemWidth = carouselContainer.clientWidth * 0.9;
      slidesToShow = 1;
    } else if (window.innerWidth < 992) {
      // Tablet: show one main slide with peek at 80% width
      itemWidth = carouselContainer.clientWidth * 0.8;
      slidesToShow = 1;
    } else {
      // Desktop: show 3 slides with center focused
      itemWidth = carouselContainer.clientWidth / 3;
      slidesToShow = 3;
    }

    // Update item widths
    carouselItems.forEach((item) => {
      item.style.minWidth = `${itemWidth}px`;
      item.style.maxWidth = `${itemWidth}px`;
    });

    // Position the track to center the active slide
    positionTrack();
  }

  // Position the track to center the active slide
  function positionTrack() {
    if (filteredItems.length === 0) return;

    const containerWidth = carouselTrack.parentElement.clientWidth;
    const centerOffset = (containerWidth - itemWidth) / 2;

    // Ensure items are vertically centered
    carouselItems.forEach((item) => {
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.justifyContent = "center";
    });

    carouselTrack.style.left = `${centerOffset}px`;
  }

  // Go to specific slide
  function goToSlide(index) {
    if (filteredItems.length === 0) return;

    // Handle bounds
    if (index < 0) index = 0;
    if (index >= filteredItems.length) index = filteredItems.length - 1;

    currentIndex = index;

    // Update track position with smooth animation
    const translateX = -currentIndex * itemWidth;
    carouselTrack.style.transform = `translateX(${translateX}px)`;

    // Update active classes
    carouselItems.forEach((item, i) => {
      item.classList.remove("active");

      // Add active class to current item
      if (i === currentIndex) {
        item.classList.add("active");

        // Bring active item to front with z-index
        item.style.zIndex = "10";

        // Create a full-screen effect for active item
        if (window.innerWidth >= 768) {
          // Apply on tablets and desktops
          item.style.position = "relative";

          // Make sure active item is centered vertically
          item.style.display = "flex";
          item.style.alignItems = "center";

          // Add slight delay to allow transition to complete
          setTimeout(() => {
            positionTrack();
          }, 50);
        }
      } else {
        // Reset z-index for non-active items but maintain vertical centering
        item.style.zIndex = "1";
        item.style.position = "";

        // Ensure non-active items are vertically centered
        item.style.display = "flex";
        item.style.alignItems = "center";
      }
    });

    // Update indicators
    const indicatorElements = document.querySelectorAll(".carousel-indicator");
    indicatorElements.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === currentIndex);
    });
  }

  // Next slide
  function nextSlide() {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= filteredItems.length) {
      nextIndex = 0; // Loop back to start
    }
    goToSlide(nextIndex);
  }

  // Previous slide
  function prevSlide() {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = filteredItems.length - 1; // Loop to end
    }
    goToSlide(prevIndex);
  }

  // Filter items by category
  function filterItems(category) {
    // Reset all items
    carouselItems.forEach((item) => {
      item.classList.remove("hide");
      item.style.display = "";
    });

    // Filter by category
    if (category !== "all") {
      carouselItems.forEach((item) => {
        if (!item.classList.contains(category)) {
          item.classList.add("hide");
          item.style.display = "none";
        }
      });
    }

    // Update filtered items array
    filteredItems = [...carouselItems].filter(
      (item) => !item.classList.contains("hide")
    );

    // Reset to first visible slide if possible, or stay at current index if valid
    let newIndex = 0;
    if (filteredItems.length > 0) {
      if (currentIndex < filteredItems.length) {
        // Try to keep current position if possible
        newIndex = currentIndex;
      } else {
        // Otherwise go to first filtered item
        newIndex = 0;
      }
    }

    // Go to the appropriate slide
    goToSlide(newIndex);

    // Update indicators
    updateIndicators();

    // Reposition track after filtering
    setTimeout(positionTrack, 50);
  }

  // Update indicators based on filtered items
  function updateIndicators() {
    const indicatorElements = document.querySelectorAll(".carousel-indicator");

    // Hide all indicators first
    indicatorElements.forEach((indicator) => {
      indicator.style.display = "none";
    });

    // Show only indicators for visible items
    filteredItems.forEach((_, index) => {
      if (index < indicatorElements.length) {
        indicatorElements[index].style.display = "";
      }
    });

    // Update active indicator
    indicatorElements.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === currentIndex);
    });
  }

  // Initialize if carousel elements exist
  if (carouselTrack && carouselItems.length > 0) {
    initCarousel();
  }

  // Testimonial Slider Functionality
  const testimonialSlides = document.querySelectorAll(".testimonial-slide");
  const prevTestimonial = document.querySelector(".prev-testimonial");
  const nextTestimonial = document.querySelector(".next-testimonial");
  const testimonialDots = document.querySelector(".testimonial-dots");

  let currentSlide = 0;

  // Initialize testimonial slider
  function initTestimonialSlider() {
    if (testimonialSlides.length > 0) {
      // Create dots
      testimonialSlides.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => showTestimonialSlide(index));
        testimonialDots.appendChild(dot);
      });

      // Set first slide as active
      testimonialSlides[0].classList.add("active");

      // Set click events for navigation
      prevTestimonial.addEventListener("click", prevTestimonialSlide);
      nextTestimonial.addEventListener("click", nextTestimonialSlide);

      // Auto play slider
      setInterval(nextTestimonialSlide, 5000);
    }
  }

  function showTestimonialSlide(index) {
    testimonialSlides.forEach((slide) => slide.classList.remove("active"));
    document
      .querySelectorAll(".dot")
      .forEach((dot) => dot.classList.remove("active"));

    testimonialSlides[index].classList.add("active");
    document.querySelectorAll(".dot")[index].classList.add("active");

    currentSlide = index;
  }

  function nextTestimonialSlide() {
    currentSlide = (currentSlide + 1) % testimonialSlides.length;
    showTestimonialSlide(currentSlide);
  }

  function prevTestimonialSlide() {
    currentSlide =
      (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
    showTestimonialSlide(currentSlide);
  }

  initTestimonialSlider();

  // Contact Form Validation
  const contactForm = document.getElementById("inquiry-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Basic form validation
      let isValid = true;
      const formInputs = contactForm.querySelectorAll(
        "input, select, textarea"
      );

      formInputs.forEach((input) => {
        if (input.hasAttribute("required") && !input.value.trim()) {
          isValid = false;
          input.classList.add("error");
        } else {
          input.classList.remove("error");
        }
      });

      // If form is valid, show success message (in a real scenario, you would send the form data to a server)
      if (isValid) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Change button text and disable
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
          // Create success message
          const successMessage = document.createElement("div");
          successMessage.classList.add("success-message");
          successMessage.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <p>Thank you for your message! We'll get back to you soon.</p>
                    `;

          // Replace form with success message
          contactForm.innerHTML = "";
          contactForm.appendChild(successMessage);

          // Add CSS for success message
          const style = document.createElement("style");
          style.innerHTML = `
                        .success-message {
                            text-align: center;
                            padding: 30px;
                        }
                        .success-message i {
                            font-size: 50px;
                            color: #2ecc71;
                            margin-bottom: 20px;
                        }
                        .success-message p {
                            font-size: 18px;
                            font-weight: 500;
                        }
                    `;
          document.head.appendChild(style);
        }, 1500);
      }
    });
  }

  // Back to Top Button
  const backToTopBtn = document.querySelector(".back-to-top");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("active");
    } else {
      backToTopBtn.classList.remove("active");
    }
  });

  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Scroll Animation for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      if (this.getAttribute("href") !== "#") {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: "smooth",
          });
        }
      }
    });
  });

  // Add hover effect to service cards for touch devices
  const serviceCards = document.querySelectorAll(".service-card");

  if ("ontouchstart" in window || navigator.maxTouchPoints) {
    serviceCards.forEach((card) => {
      card.addEventListener("touchstart", function () {
        // Remove active class from all cards
        serviceCards.forEach((c) => c.classList.remove("touch-active"));
        // Add active class to touched card
        this.classList.add("touch-active");
      });
    });

    // Add CSS for touch active state
    const style = document.createElement("style");
    style.innerHTML = `
            .service-card.touch-active::before {
                width: 100%;
            }
            .service-card.touch-active {
                transform: translateY(-10px);
            }
            .service-card.touch-active h3,
            .service-card.touch-active p {
                color: #fff;
            }
            .service-card.touch-active .service-icon {
                background-color: #fff;
            }
        `;
    document.head.appendChild(style);
  }

  // Intersection Observer for animated counters (could be added in the future)
  // Lazyload for images (could be added for performance optimization)
});

// Preload Hero Image for better UX
window.addEventListener("load", function () {
  const heroImage = new Image();
  heroImage.src = "images/finished roof 7.jpg";
});
