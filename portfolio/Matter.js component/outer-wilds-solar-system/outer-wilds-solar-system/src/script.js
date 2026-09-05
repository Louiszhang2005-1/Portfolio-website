class Wanderer extends HTMLElement {
  constructor() {
    super();
  }
  
  static observedAttributes = ['image'];

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'image') {
      // Pre-load the image before replacing the solid colour with the image
      const img = new Image();
      img.onload = () => { this.style.setProperty('--w-image', `url(${newValue})`); }
      img.src = newValue;
    }
  }
}
customElements.define('ow-wanderer', Wanderer);

class Starfield extends HTMLElement {
  constructor() {
    super();
    this.svgNS = 'http://www.w3.org/2000/svg';
  }
  
  static observedAttributes = ['stars'];

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'stars') {
      Array.from(this.querySelectorAll('ow-star')).forEach(s => s.parentElement.removeChild(s));
      
      const starCount = parseInt(newValue, 10);
      const svgElId = this.getAttribute('use');
      const originalViewBox = document.getElementById(svgElId).closest('svg').getAttribute('viewBox').trim().split(' ');
      const originalSize = parseFloat(originalViewBox[3]); // It's hip to be square
      
      if (!isNaN(starCount) && starCount > 0 && svgElId) {
        for (let s = 0; s < starCount; s++) {
          const star = document.createElement('ow-star');
          const svg = document.createElementNS(this.svgNS, 'svg');
          const use = document.createElementNS(this.svgNS, 'use');
          const scale = (0.25 + Math.random() * 0.75).toPrecision(4);
          const size = (Math.round(scale * originalSize)).toPrecision(4);
          const delay = (Math.random() * 0.75).toPrecision(4);
          const posX = (Math.random() * 100).toPrecision(4);
          const posY = (Math.random() * 100).toPrecision(4);
          const angle = Math.floor(Math.random() * 360);
          
          use.setAttributeNS(this.svgNS, 'xlink:href', `#${svgElId}`);
          use.setAttribute('width', originalSize);
          use.setAttribute('height', originalSize);
          use.setAttribute('transform', `rotate(${angle} ${originalSize/2} ${originalSize/2})`)
          
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
          svg.setAttribute('width', size);
          svg.setAttribute('height', size);
          svg.setAttribute('viewBox', originalViewBox.join(' '));
          svg.setAttribute('class', 'starclone');
          
          // star.style.setProperty('--scale', scale);
          star.style.setProperty('--delay', delay);
          star.style.setProperty('--star-x', posX + '%');
          star.style.setProperty('--star-y', posY + '%');
          
          svg.appendChild(use);
          star.appendChild(svg)
          this.appendChild(star);
        }
        
        this.innerHTML += ' '; // Hacky BS to force the SVG to render, sorry
      }
    }
  }
}
customElements.define('ow-starfield', Starfield);

document.addEventListener('DOMContentLoaded', function() {
  // Make the quantum moon jump around randomly
  const quantumMoon = document.getElementById('quantum-moon');
  const quantumOrbits = Array.from(document.querySelectorAll('[quantum]'));
  quantumMoon.addEventListener('animationiteration', (e) => {
    if (e.animationName !== '--quantum') { return; }
    const currOrbit = quantumMoon.closest('[quantum]');
    const availableOrbits = quantumOrbits.filter(o => o !== currOrbit);
    const newOrbit = availableOrbits[Math.floor(Math.random() * availableOrbits.length)];
    const newWanderer = newOrbit.querySelector(':scope > ow-wanderer');
    newWanderer.appendChild(quantumMoon);
  });
  
  const doc = document.documentElement;
  const solarSystem = document.querySelector('ow-system');
  const form = document.querySelector('form');
  
  solarSystem.addEventListener('animationiteration', (e) => {
    if (e.animationName !== '--supernova') { return; }
    
    // Restarts all animations from the correct position (yes it's a nasty way to do it, I know...)
    requestAnimationFrame(() => {
      solarSystem.hidden = true;
      requestAnimationFrame(() => {
        solarSystem.hidden = false;
      });
    });
  });
  
  form.hidden = false;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  
  form.addEventListener('change', (e) => {
    const controls = ['timelapse', 'orbits', 'labels', 'paused', 'stars'];
    for (let control of controls) {
      if (e.target.closest(`#ctrl-${control}`)) {
        const bool = solarSystem.getAttribute(control) === 'true';
        solarSystem.setAttribute(control, (!bool).toString());
      }
    }
  })
});