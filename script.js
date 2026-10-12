const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis = null;
let animate = false;
const hasLenis = typeof Lenis !== 'undefined';
const hasGsap = typeof gsap !== 'undefined';
const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';

if (hasLenis && !prefersReducedMotion) {
  lenis = new Lenis({ duration: 0.9, smoothWheel: true });

  if (!hasGsap) {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
}

if (hasGsap && !prefersReducedMotion) {
  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    animate = true;
    document.documentElement.classList.add('js-anim');
    
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  if (lenis) {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

const wrapWords = (element) => {
  const newChildNodes = [];
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach(part => {
        if (part.trim() !== '') {
          const span = document.createElement('span');
          span.classList.add('word');
          span.textContent = part;
          newChildNodes.push(span);
        }
        else {
          const textNode = document.createTextNode(part);
          newChildNodes.push(textNode);
        }
      }); 
    }
    else if (node.nodeType === Node.ELEMENT_NODE) {
      node.replaceChildren(...wrapWords(node));
      newChildNodes.push(node);
    }
    else {
      newChildNodes.push(node);
    }
  });

  return newChildNodes;
}

if (animate) {
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true }),
  });

  const introStatement = document.querySelector('.intro__statement');
  const introStatementText = introStatement.textContent.trim();
  introStatement.replaceChildren(...wrapWords(introStatement));
  introStatement.setAttribute('aria-label', introStatementText);

  gsap.to(introStatement.querySelectorAll('.word'), {
    opacity: 1,
    stagger: 0.1,
    ease: "none",
    scrollTrigger: { trigger: introStatement, start: "top 80%", end: "bottom 45%", scrub: true },
  });

  document.querySelectorAll('.media__frame').forEach((frame) => {
    gsap.fromTo(frame, 
      {
        clipPath: "inset(12% 6% 12% 6% round var(--radius))",
      }, 
      {
        clipPath: "inset(0% 0% 0% 0% round var(--radius))",
        ease: "expo.out",
        duration: 1.6,
        scrollTrigger: { trigger: frame, start: "top 85%", once: true,  },
        onComplete: () => { gsap.set(frame, { clearProps: "clipPath" })  }
      }
    );

    const inner = frame.querySelector('video, img');
    gsap.fromTo(inner, 
      {
        scale: 1.12,
      }, 
      {
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  });

  gsap.to(document.querySelector('.hero__name'), 
    {
      opacity: 0.3,
      ease: "none",
      scrollTrigger: { trigger: '.hero', start: "top top", end: "bottom top", scrub: true },
    }
  );

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
  });
}


document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    if (!lenis) return;
    let href = link.getAttribute('href');
    if (href === '#') href = '#top';

    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});


const marqueeTrack = document.querySelector('.marquee__track');

if (marqueeTrack) {
  let lastScrollY = window.scrollY;
  let scrollDirection = 'normal';
  document.addEventListener('scroll', () => {
    const [marqueeAnimation] = marqueeTrack.getAnimations();
    if (!marqueeAnimation) {
      lastScrollY = window.scrollY;
      return;
    }

    if (window.scrollY === lastScrollY) return;
    const currentScrollDirection = window.scrollY > lastScrollY ? 'normal' : 'reverse';
    lastScrollY = window.scrollY;

    if (currentScrollDirection === scrollDirection) return;

    scrollDirection = currentScrollDirection;

    marqueeAnimation.effect.updateTiming({ direction: scrollDirection }); 
    const duration = marqueeAnimation.effect.getComputedTiming().duration;
    marqueeAnimation.currentTime = duration - (marqueeAnimation.currentTime % duration); 
  });
}

/*
  == Grid background mouse position ==

  Only enable the effect on devices that support hover (desktop devices)
  Mouse position is only updated a maximum of once per frame
*/
if (matchMedia('(hover: hover)').matches) {
  const below = document.querySelector('.below');
  let clientX = 0, clientY = 0, mouseUpdateQueued = false;

  // Calculate the mouse position relative to the .below element and update CSS variables
  const updateMousePosition = () => {
    const boundingRect = below.getBoundingClientRect(); 
    const mx = clientX - boundingRect.left;
    const my = clientY - boundingRect.top;

    below.style.setProperty('--mx', `${mx}px`);
    below.style.setProperty('--my', `${my}px`);
    mouseUpdateQueued = false;
  };

  const queueMouseUpdate = () => {
    if (mouseUpdateQueued) return;
    
    mouseUpdateQueued = true;
    requestAnimationFrame(updateMousePosition);
  };

  below.addEventListener('pointerenter', () => {
    below.classList.add('is-lit');
  });

  below.addEventListener('pointerleave', () => {
    below.classList.remove('is-lit');
  });

  // Queue a mouse position update on pointermove 
  below.addEventListener('pointermove', (e) => {
    clientX = e.clientX;
    clientY = e.clientY;
    queueMouseUpdate();
  });

  // Queue a mouse position update on scroll only if the .below element is lit
  document.addEventListener('scroll', () => {
    if (!below.classList.contains('is-lit')) return; 
    queueMouseUpdate();
  });
}

const clocks = document.querySelectorAll('.js-clock');

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Istanbul",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const updateClock = () => {
  const text = fmt.format(new Date());
  clocks.forEach((element) => {
    element.textContent = text;
  });
};

// Update the clock on page load
updateClock();

// Update the clock every 15 seconds 
setInterval(updateClock, 15000);

const nav = document.querySelector('.nav');

const updateNav = () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
};

// Update the nav on page load
updateNav();

// Update the nav on scroll
document.addEventListener('scroll', updateNav);

const videos = document.querySelectorAll('.js-video');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.play();
    } else {
      video.pause();
    }
  });
}, { threshold: 0.25 });

if (prefersReducedMotion) {
  videos.forEach((video) => {
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  });
} else {
  videos.forEach((video) => {
    observer.observe(video);
  });
}

const progressBar = document.querySelector('.progress-bar');
const progressBarFill = document.querySelector('.progress-bar__fill');
const startingDate = document.querySelector('.timeline').getAttribute('data-start');
const endingDate = document.querySelector('.timeline').getAttribute('data-end');
const progress = Math.min(Math.max((new Date() - new Date(startingDate)) / (new Date(endingDate) - new Date(startingDate)) * 100, 0), 100);

document.querySelector('.timeline__year').textContent = `${Math.min(Math.floor(progress / 100 * 4) + 1, 4)}`;
document.querySelector('.timeline__percent').textContent = `${Math.round(progress)}`;
progressBar.setAttribute('aria-valuenow', `${Math.round(progress)}`);

if (prefersReducedMotion) {
  progressBarFill.style.width = `${progress}%`;
} else {
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        progressBarFill.style.width = `${progress}%`;
        progressObserver.disconnect();
      }
    });
  }, { threshold: 0.25 });
 
  progressObserver.observe(progressBar);
}

const copyButtons = document.querySelectorAll('.js-copy');
let timerID = null;

copyButtons.forEach((btn) => {
  const status = btn.parentElement.querySelector('.js-copy-status');

  btn.addEventListener('click', async () => {
    const text = btn.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      status.textContent = 'Email address copied';
    } catch (err) {
      console.error('Failed to copy text: ', err);
      btn.textContent = 'Select & copy';
      status.textContent = "Couldn't copy, select the email address to copy it";
    }

    clearTimeout(timerID);
    timerID = setTimeout(() => {
      btn.textContent = 'Copy';
      status.textContent = '';
    }, 2000);
  });
});

const footerYear = document.querySelector('.js-footer-year');
const currentYear = new Date().getFullYear();
footerYear.textContent = currentYear;

let simulation = new Simulation(200, 100, document.querySelector('.simulation'));

const runSimulation = async () => { 
  while (true) {
    simulation.grid.at(50).type = 2;
    simulation.Update();
    simulation.Draw();
    await new Promise(requestAnimationFrame);
  }
}

runSimulation();