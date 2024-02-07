class ParticleAnimation {
  canvas: HTMLCanvasElement;
  canvasContainer: HTMLElement | null=null;
  context: CanvasRenderingContext2D | null=null;
  dpr: number=0;
  settings: { quantity: number; staticity: number; ease: number }= { quantity: 30, staticity: 50, ease: 50 };
  circles: any[]=[];
  mouse: { x: number; y: number }={ x: 0, y: 0 }
  canvasSize: { w: number; h: number }= { w: 0, h: 0 };
  constructor(el: HTMLCanvasElement, { quantity = 30, staticity = 50, ease = 50 } = {}) {
    this.canvas = el;
    if (!this.canvas.parentElement) return;
    this.canvasContainer = this.canvas.parentElement;
    this.context = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.settings = {
      quantity: quantity,
      staticity: staticity,
      ease: ease,
    };
    this.circles = [];
    this.mouse = {
      x: 0,
      y: 0,
    };
    this.canvasSize = {
      w: 0,
      h: 0,
    };
    this.onMouseMove = this.onMouseMove.bind(this);
    this.initCanvas = this.initCanvas.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.drawParticles = this.drawParticles.bind(this);
    this.remapValue = this.remapValue.bind(this);
    this.animate = this.animate.bind(this);
    this.init();
  }

  init() {
    this.initCanvas();
    this.animate();
    window.addEventListener("resize", this.initCanvas);
    window.addEventListener("mousemove", this.onMouseMove);
  }

  initCanvas() {
    this.resizeCanvas();
    this.drawParticles();
  }

  onMouseMove(event: MouseEvent) {
    const { clientX, clientY } = event;
    const rect = this.canvas.getBoundingClientRect();
    const { w, h } = this.canvasSize;
    const x = clientX - rect.left - w / 2;
    const y = clientY - rect.top - h / 2;
    const inside = x < w / 2 && x > -(w / 2) && y < h / 2 && y > -(h / 2);
    if (inside) {
      this.mouse.x = x;
      this.mouse.y = y;
    }
  }

  resizeCanvas() {
    this.circles.length = 0;
    if (!this.canvasContainer) return;
    this.canvasSize.w = this.canvasContainer.offsetWidth;
    this.canvasSize.h = this.canvasContainer.offsetHeight;
    this.canvas.width = this.canvasSize.w * this.dpr;
    this.canvas.height = this.canvasSize.h * this.dpr;
    this.canvas.style.width = this.canvasSize.w + "px";
    this.canvas.style.height = this.canvasSize.h + "px";
    this.context?.scale(this.dpr, this.dpr);
  }

  circleParams() {
    const x = Math.floor(Math.random() * this.canvasSize.w);
    const y = Math.floor(Math.random() * this.canvasSize.h);
    const translateX = 0;
    const translateY = 0;
    const size = Math.random() * 0.6 + 0.6;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.2;
    const dy = (Math.random() - 0.5) * 0.2;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  }

  drawCircle(circle: any, update = false) {
    const { x, y, translateX, translateY, size, alpha } = circle;
    if (!this.context) return;
    this.context.translate(translateX, translateY);
    this.context.beginPath();
    this.context.arc(x, y, size, 0, 2 * Math.PI);
    this.context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.context.fill();
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!update) {
      this.circles.push(circle);
    }
  }

  clearContext() {
    this.context?.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  }

  drawParticles() {
    this.clearContext();
    const particleCount = this.settings.quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = this.circleParams();
      this.drawCircle(circle);
    }
  }

  remapValue(value: number, start1: number, end1: number, start2: number, end2: number) {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  }

  animate() {
    this.clearContext();
    this.circles.forEach((circle, i) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        this.canvasSize.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        this.canvasSize.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = this.remapValue(
        closestEdge,
        0,
        20,
        0,
        1
      ).toFixed(2);
      if (parseFloat(remapClosestEdge) > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha)
          circle.alpha = circle.targetAlpha;
      } else {
        circle.alpha = circle.targetAlpha * parseFloat(remapClosestEdge);
      }

      const angle =
        Math.atan2(this.mouse.y - circle.y, this.mouse.x - circle.x) -
        Math.PI / 2;
      const velocity = {
        x: Math.cos(angle) * 0.2,
        y: Math.sin(angle) * 0.2,
      };
      circle.x += velocity.x;
      circle.y += velocity.y;

      circle.translateX +=
        (this.mouse.x / (this.settings.staticity / circle.magnetism) -
          circle.translateX) /
        this.settings.ease;
      circle.translateY +=
        (this.mouse.y / (this.settings.staticity / circle.magnetism) -
          circle.translateY) /
        this.settings.ease;

      if (
        circle.x < -circle.size ||
        circle.x > this.canvasSize.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > this.canvasSize.h + circle.size
      ) {
        this.circles.splice(i, 1);
        const circle = this.circleParams();
        this.drawCircle(circle);
      } else {
        this.drawCircle(
          {
            ...circle,
            x: circle.x,
            y: circle.y,
            translateX: circle.translateX,
            translateY: circle.translateY,
            alpha: circle.alpha,
          },
          true
        );
      }
    });
    window.requestAnimationFrame(this.animate);
  }
}

export default ParticleAnimation;
