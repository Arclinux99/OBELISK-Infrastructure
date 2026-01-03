import { Component, ElementRef, ViewChild, AfterViewInit, signal, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

// Declare GSAP since it's loaded via CDN
declare var gsap: any;
declare var ScrollTrigger: any;

interface TerminalCommand {
  text: string;
  type: 'cmd' | 'log' | 'success' | 'cmd_blink';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: [] 
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monolithWrapper') monolithWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('neuralGrid') neuralGrid!: ElementRef<HTMLDivElement>;
  @ViewChild('terminalOutput') terminalOutput!: ElementRef<HTMLDivElement>;
  @ViewChild('liveChart') liveChart!: ElementRef<HTMLDivElement>;
  @ViewChild('cardsContainer') cardsContainer!: ElementRef<HTMLDivElement>;

  // Signals for state
  menuOpen = signal(false);
  
  // Terminal commands
  commands: TerminalCommand[] = [
    { text: "root@obelisk:~# ./init_sequence.sh", type: "cmd" },
    { text: "Loading core modules...", type: "log" },
    { text: "> [OK] Quantum Mesh", type: "success" },
    { text: "> [OK] Database Sharding", type: "success" },
    { text: "> [OK] Global CDN Nodes", type: "success" },
    { text: "System ready. Listening on port 443...", type: "log" },
    { text: "root@obelisk:~# _", type: "cmd_blink" }
  ];

  private resizeListener: (() => void) | null = null;
  private animFrameId: number | null = null;
  private isBrowser: boolean;
  private typeTimeoutId: any;
  private scrollTriggers: any[] = [];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    // Register GSAP Plugin
    gsap.registerPlugin(ScrollTrigger);

    this.initParticles();
    this.initMonolith();
    this.initSpotlight();
    this.initPipelineScroll();
    this.initNeuralGrid();
    this.initLiveChart();
    this.initVelocityAnimations();
    this.initTerminal();
    this.initFooterReveal();
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      if (this.resizeListener) {
        window.removeEventListener('resize', this.resizeListener);
      }
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
      }
      clearTimeout(this.typeTimeoutId);
      
      // Kill all ScrollTriggers created by this component
      this.scrollTriggers.forEach(t => t.kill());
      ScrollTrigger.refresh(); // Refresh to ensure layout is clean
    }
  }

  // --- 1. HERO PARTICLES ---
  initParticles() {
    const canvas = this.particleCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    this.resizeListener = resize;

    class Particle {
      x: number;
      y: number;
      z: number;

      constructor() {
        this.x = (Math.random() - 0.5) * width;
        this.y = (Math.random() - 0.5) * height;
        this.z = Math.random() * 2000;
      }

      update() {
        this.z -= 4;
        if (this.z <= 0) {
          this.z = 2000;
          this.x = (Math.random() - 0.5) * width;
          this.y = (Math.random() - 0.5) * height;
        }
      }

      draw() {
        const p = 300 / (this.z + 0.1);
        const sx = width / 2 + this.x * p;
        const sy = height / 2 + this.y * p;
        const a = Math.min(1, (2000 - this.z) / 1000);
        
        if (ctx) {
          ctx.fillStyle = `rgba(255, 0, 60, ${a})`;
          ctx.fillRect(sx, sy, 2 * p, 2 * p);
        }
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 1500; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!ctx) return;
      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      this.animFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  // --- 2. MONOLITH ANIMATION ---
  initMonolith() {
    // Mouse movement parallax
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      
      gsap.to(this.monolithWrapper.nativeElement, {
        rotationY: x * 15,
        rotationX: 10 + (y * -10),
        duration: 1,
        ease: "power2.out"
      });
    });

    // Scroll animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "+=1500",
        pin: true,
        scrub: 0.5
      }
    });

    tl.to(this.monolithWrapper.nativeElement, {
      z: 600,
      rotationY: "+=120",
      rotationX: "+=20",
      duration: 1,
      ease: "power1.inOut"
    }, 0)
    .to(".hero-title-1", { x: -400, opacity: 0, blur: 20 }, 0)
    .to(".hero-title-2", { scale: 2, opacity: 0, blur: 20 }, 0)
    .to(".hero-title-3", { x: 400, opacity: 0, blur: 20 }, 0)
    .to(".hero-subtitle", { y: 50, opacity: 0 }, 0);
  }

  // --- 3. SPOTLIGHT HOVER ---
  initSpotlight() {
    const container = this.cardsContainer.nativeElement;
    container.addEventListener("mousemove", (e: MouseEvent) => {
      const cards = container.getElementsByClassName("tech-card");
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      }
    });
  }

  // --- 4. PIPELINE HORIZONTAL SCROLL ---
  initPipelineScroll() {
    const races = document.querySelector(".pin-wrap");
    if (!races) return;

    const getScrollAmount = () => -(races.scrollWidth - window.innerWidth);
    
    const tween = gsap.to(races, {
      x: getScrollAmount,
      ease: "none"
    });

    const st = ScrollTrigger.create({
      trigger: ".pipeline-section",
      start: "top top",
      end: () => `+=${races.scrollWidth - window.innerWidth}`,
      pin: true,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true
    });
    this.scrollTriggers.push(st);

    // Parallax inside cards
    gsap.utils.toArray('.horiz-img').forEach((img: any) => {
      gsap.fromTo(img, 
        { xPercent: -15 },
        {
          xPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: ".pipeline-section",
            start: "top top",
            end: () => `+=${races.scrollWidth - window.innerWidth}`,
            scrub: true
          }
        }
      );
    });
  }

  // --- 5. NEURAL GRID ---
  initNeuralGrid() {
    const grid = this.neuralGrid.nativeElement;
    const cols = Math.ceil(window.innerWidth / 30);
    const rows = Math.ceil((window.innerHeight * 1.5) / 30);
    const totalDots = cols * rows;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('div');
      dot.classList.add('neural-dot');
      dot.style.width = '2px';
      dot.style.height = '2px';
      dot.style.background = '#333';
      dot.style.borderRadius = '50%';
      dot.style.transition = 'transform 0.1s ease-out, background 0.2s';
      dot.style.willChange = 'transform';
      grid.appendChild(dot);
    }
    
    // Grid layout
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(30px, 1fr))`;
    grid.style.gap = '0';

    const section = document.querySelector('.neural-section') as HTMLElement;
    if (section) {
      section.addEventListener('mousemove', (e) => {
        const dots = document.querySelectorAll('.neural-dot');
        const rect = grid.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const radius = 350;
  
        dots.forEach((dot: any) => {
          const dotRect = dot.getBoundingClientRect();
          const dx = (dotRect.left - rect.left) - mx;
          const dy = (dotRect.top - rect.top) - my;
          const dist = Math.sqrt(dx*dx + dy*dy);
  
          if (dist < radius) {
            const force = (radius - dist) / radius;
            const angle = Math.atan2(dy, dx);
            const moveX = Math.cos(angle) * force * 50;
            const moveY = Math.sin(angle) * force * 50;
            dot.style.transform = `translate(${moveX}px, ${moveY}px)`;
            dot.style.background = '#555';
          } else {
            dot.style.transform = `translate(0,0)`;
            dot.style.background = '#333';
          }
        });
      });
    }
  }

  // --- 6. LIVE CHART ---
  initLiveChart() {
    const chartArea = this.liveChart.nativeElement;
    for (let i = 0; i < 30; i++) {
      const bar = document.createElement('div');
      bar.classList.add('chart-bar');
      bar.style.flex = '1';
      bar.style.background = 'linear-gradient(0deg, #ff003c 0%, transparent 100%)';
      bar.style.opacity = '0.3';
      bar.style.borderTop = '1px solid #ff003c';
      bar.style.animation = 'chartMove 3s infinite ease-in-out';
      bar.style.animationDelay = `${Math.random() * 2}s`;
      chartArea.appendChild(bar);
    }
  }

  // --- 7. VELOCITY SECTION ANIMATIONS ---
  initVelocityAnimations() {
    gsap.to(".code-card", {
      scrollTrigger: { trigger: ".dev-section", start: "top 70%" },
      x: 0, opacity: 1, duration: 0.8, ease: "power2.out"
    });

    gsap.utils.toArray('.feature-block').forEach((block: any, i: number) => {
      gsap.to(block, {
        scrollTrigger: { trigger: block, start: "top 85%" },
        x: 0, opacity: 1, duration: 0.6, delay: i * 0.1, ease: "power2.out"
      });
    });
  }

  // --- 8. TERMINAL TYPING ---
  initTerminal() {
    let cmdIndex = 0;
    let charIndex = 0;
    let isTyping = false;
    const output = this.terminalOutput.nativeElement;

    const typeLine = () => {
      if (cmdIndex >= this.commands.length) return;
      const lineData = this.commands[cmdIndex];
      let lineEl = document.querySelector(`#line-${cmdIndex}`) as HTMLElement | null;

      if (!lineEl) {
        lineEl = document.createElement('div');
        lineEl.id = `line-${cmdIndex}`;
        lineEl.style.marginBottom = '0.8rem';
        lineEl.style.display = 'flex';
        lineEl.style.minHeight = '1.5em';
        lineEl.style.fontFamily = "'Courier New', monospace";
        
        // Color logic
        if (lineData.type === 'cmd' || lineData.type === 'cmd_blink') lineEl.style.color = '#fff';
        else if (lineData.type === 'success') lineEl.style.color = '#ff003c';
        else lineEl.style.color = '#888';
        
        output.appendChild(lineEl);
      }

      if (charIndex < lineData.text.length) {
        lineEl!.textContent += lineData.text.charAt(charIndex);
        charIndex++;
        this.typeTimeoutId = setTimeout(typeLine, Math.random() * 30 + 10);
      } else {
        cmdIndex++;
        charIndex = 0;
        this.typeTimeoutId = setTimeout(typeLine, 200);
      }
    };

    const st = ScrollTrigger.create({
      trigger: ".terminal-section",
      start: "top 60%",
      once: true,
      onEnter: () => {
        if (!isTyping) {
          isTyping = true;
          typeLine();
        }
      }
    });
    this.scrollTriggers.push(st);
  }

  // --- 9. FOOTER REVEAL ---
  initFooterReveal() {
    const st = ScrollTrigger.create({
      trigger: "body",
      start: "bottom bottom",
      onEnter: () => document.body.classList.add('reveal-active'),
      onLeaveBack: () => document.body.classList.remove('reveal-active')
    });
    this.scrollTriggers.push(st);
  }
}
