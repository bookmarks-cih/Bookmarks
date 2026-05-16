document.addEventListener('DOMContentLoaded', () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ========================
      // HEADER
      // ========================
      const header = document.querySelector('.header');
      const toggle = document.querySelector('.nav-toggle');
      const navLinks = document.querySelectorAll('.nav-link, .nav-cta');

      if (toggle && header) {
        toggle.addEventListener('click', () => {
          const isOpen = header.classList.toggle('menu-open');
          toggle.setAttribute('aria-expanded', String(isOpen));
        });
      }

      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (header && header.classList.contains('menu-open')) {
            header.classList.remove('menu-open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
          }
        });
      });

      window.addEventListener('scroll', () => {
        if (!header) return;
        if (header.classList.contains('menu-open')) {
          header.classList.remove('menu-open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
        header.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });

      // ========================
      // PLAN SELECTION
      // ========================
      const planCards = document.querySelectorAll('.plan-card');
      const selectedPlanInput = document.getElementById('selectedPlan');
      const planPriceInput = document.getElementById('planPrice');
      const stripeEmbed = document.getElementById('stripeEmbed');
      const stripeEmbedTitle = document.getElementById('stripeEmbedTitle');
      const stripePriority = document.getElementById('stripePriority');
      const stripeUX = document.getElementById('stripeUX');
      const planSummaryPill = document.getElementById('planSummaryPill');
      const planSummaryText = document.getElementById('planSummaryText');
      const paidPlanNotice = document.getElementById('paidPlanNotice');
      const step1 = document.getElementById('step1');
      const step2 = document.getElementById('step2');
      const step3 = document.getElementById('step3');

      function selectPlan(card) {
        // Update aria + classes
        planCards.forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');

        const plan = card.dataset.plan;
        const price = parseInt(card.dataset.price, 10) || 0;

        selectedPlanInput.value = plan;
        planPriceInput.value = price;

        const isPaid = price > 0;

        // Stripe embed visibility
        if (isPaid) {
          stripeEmbed.classList.add('visible');
          stripeEmbedTitle.textContent = `Complete payment — ${plan} €${price}`;

          // Show correct Stripe button
          stripePriority.style.display = plan === 'Priority Review' ? 'flex' : 'none';
          stripeUX.style.display = plan === 'UX Feedback + Visibility' ? 'flex' : 'none';

          // Summary pill
          planSummaryText.textContent = `${plan} selected — complete payment above`;
          paidPlanNotice.classList.add('visible');

          // Steps
          step1.classList.add('done'); step1.classList.remove('active');
          step2.classList.add('active');
          step3.classList.remove('active');
        } else {
          stripeEmbed.classList.remove('visible');
          planSummaryText.textContent = 'Free Review selected — no payment required';
          paidPlanNotice.classList.remove('visible');

          // Steps
          step1.classList.add('done'); step1.classList.remove('active');
          step2.classList.remove('active');
          step3.classList.add('active');
        }
      }

      planCards.forEach(card => {
        card.addEventListener('click', () => selectPlan(card));
      });

      // ========================
      // FORM SUBMISSION
      // ========================
      const form = document.getElementById('contactForm');
      const submitBtn = document.getElementById('submitBtn');

      if (form && submitBtn) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          if (!form.checkValidity()) {
            form.reportValidity();
            return;
          }

          submitBtn.textContent = 'Sending…';
          submitBtn.disabled = true;

          try {
            const formData = new FormData(form);

            const response = await fetch('https://formspree.io/f/mzdjovve', {
              method: 'POST',
              body: formData,
              headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
              submitBtn.textContent = '✓ Submitted!';
              form.reset();
              // Reset plan selection UI
              planCards.forEach(c => c.classList.remove('selected'));
              const freeCard = document.querySelector('[data-plan="Free Review"]');
              if (freeCard) selectPlan(freeCard);

              setTimeout(() => {
                submitBtn.textContent = 'Send submission';
                submitBtn.disabled = false;
              }, 4000);
            } else {
              const data = await response.json();
              throw new Error(data?.errors?.map(e => e.message).join(', ') || 'Submission failed');
            }
          } catch (err) {
            submitBtn.textContent = 'Error — try again';
            submitBtn.disabled = false;
            console.error('Form error:', err);
          }
        });
      }

      // ========================
      // COUNTERS
      // ========================
      if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        document.querySelectorAll('.digital-counter').forEach((el) => {
          const target = parseInt(el.dataset.target, 10) || 0;
          gsap.to(el, {
            textContent: target, duration: 2, ease: 'power1.out',
            snap: { textContent: 1 },
            scrollTrigger: { trigger: '.stats-section', start: 'top 80%', toggleActions: 'play none none none' },
            onUpdate() { this.targets()[0].textContent = Math.ceil(this.targets()[0].textContent); }
          });
        });
      } else {
        document.querySelectorAll('.digital-counter').forEach(el => { el.textContent = el.dataset.target; });
      }

      // ========================
      // SCROLL REVEALS
      // ========================
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

      // ========================
      // SLIDER
      // ========================
      const slider = document.querySelector('[data-slider]');
      if (slider) {
        const track = slider.querySelector('.slider-track');
        const slides = Array.from(slider.querySelectorAll('.slide'));
        const prevBtn = slider.querySelector('[data-prev]');
        const nextBtn = slider.querySelector('[data-next]');
        const dotsWrap = slider.querySelector('[data-dots]');
        const countDisplay = slider.querySelector('[data-count]');

        let index = 0, autoPlay, inactivityTimer;
        let touchStartX = 0, touchCurrentX = 0;

        function fmt(n) { return String(n).padStart(2, '0'); }

        function updateSlider() {
          if (!track) return;
          track.style.transform = `translateX(-${index * 100}%)`;
          dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
          countDisplay.textContent = `${fmt(index + 1)} / ${fmt(slides.length)}`;
        }

        function next() { index = (index + 1) % slides.length; updateSlider(); }
        function prev() { index = (index - 1 + slides.length) % slides.length; updateSlider(); }
        function stopAuto() { clearInterval(autoPlay); }
        function startAuto() { stopAuto(); if (!prefersReducedMotion) autoPlay = setInterval(next, 6000); }
        function pauseReset() { stopAuto(); clearTimeout(inactivityTimer); inactivityTimer = setTimeout(startAuto, 42000); }

        dotsWrap.innerHTML = '';
        slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.className = 'dot' + (i === 0 ? ' active' : '');
          dot.type = 'button';
          dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
          dot.addEventListener('click', () => { index = i; updateSlider(); pauseReset(); });
          dotsWrap.appendChild(dot);
        });

        if (nextBtn) nextBtn.addEventListener('click', () => { next(); pauseReset(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); pauseReset(); });

        slider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; touchCurrentX = touchStartX; stopAuto(); }, { passive: true });
        slider.addEventListener('touchmove', (e) => { touchCurrentX = e.touches[0].clientX; }, { passive: true });
        slider.addEventListener('touchend', () => { const d = touchCurrentX - touchStartX; if (d < -70) next(); if (d > 70) prev(); pauseReset(); });
        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);

        updateSlider();
        startAuto();
      }

      // Initial plan state
      const freeCard = document.querySelector('[data-plan="Free Review"]');
      if (freeCard) selectPlan(freeCard);
    });