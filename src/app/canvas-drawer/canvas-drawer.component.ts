import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-canvas-drawer',
  templateUrl: './canvas-drawer.component.html',
  styleUrls: ['./canvas-drawer.component.scss'],
})
export class CanvasDrawerComponent implements AfterViewInit {
  @ViewChild('imageCanvas', { static: true })
  imageCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private img = new Image();
  private annotations: any[] = [];
  private currentAnnotation: any = null;
  private isDrawing = false;
  private isResizing = false;
  private isMoving = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private resizeCornerSize = 10;
  private resizeHandle: string | null = null;
  private scale = 1;
  private minScale = 0.5;
  private maxScale = 3;
  private translateX = 0;
  private translateY = 0;

  constructor() {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.fitCanvasToWindow();
    this.draw();
  }

  ngAfterViewInit(): void {
    this.ctx = this.imageCanvas.nativeElement.getContext('2d')!;
    this.img.src = 'assets/hdfc.png'; // Path to your image in the assets folder
    this.img.onload = () => {
      this.fitCanvasToWindow();
      this.draw();
    };

    this.imageCanvas.nativeElement.addEventListener(
      'mousedown',
      this.mouseDown.bind(this)
    );
    this.imageCanvas.nativeElement.addEventListener(
      'mousemove',
      this.mouseMove.bind(this)
    );
    this.imageCanvas.nativeElement.addEventListener(
      'mouseup',
      this.mouseUp.bind(this)
    );
  }

  fitCanvasToWindow(): void {
    const canvas = this.imageCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.translateX = (canvas.width - this.img.width * this.scale) / 2;
    this.translateY = (canvas.height - this.img.height * this.scale) / 2;
  }

  draw(): void {
    if (this.ctx) {
      const canvas = this.imageCanvas.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx.save();
      this.ctx.translate(this.translateX, this.translateY);
      this.ctx.scale(this.scale, this.scale);
      this.ctx.drawImage(this.img, 0, 0);
      this.annotations.forEach((annotation) => this.drawRect(annotation));
      this.ctx.restore();
    }
  }

  drawRect(annotation: any): void {
    if (this.ctx) {
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2 / this.scale;
      this.ctx.strokeRect(
        annotation.x,
        annotation.y,
        annotation.w,
        annotation.h
      );
      this.drawHandles(annotation);
    }
  }

  drawHandles(annotation: any): void {
    if (this.ctx) {
      this.ctx.fillStyle = 'red';
      const half = this.resizeCornerSize / 2 / this.scale;

      // Corners
      this.ctx.fillRect(
        annotation.x - half,
        annotation.y - half,
        this.resizeCornerSize / this.scale,
        this.resizeCornerSize / this.scale
      );
      this.ctx.fillRect(
        annotation.x + annotation.w - half,
        annotation.y - half,
        this.resizeCornerSize / this.scale,
        this.resizeCornerSize / this.scale
      );
      this.ctx.fillRect(
        annotation.x - half,
        annotation.y + annotation.h - half,
        this.resizeCornerSize / this.scale,
        this.resizeCornerSize / this.scale
      );
      this.ctx.fillRect(
        annotation.x + annotation.w - half,
        annotation.y + annotation.h - half,
        this.resizeCornerSize / this.scale,
        this.resizeCornerSize / this.scale
      );
    }
  }

  mouseDown(event: MouseEvent): void {
    const mouseX = (event.offsetX - this.translateX) / this.scale;
    const mouseY = (event.offsetY - this.translateY) / this.scale;

    for (let annotation of this.annotations) {
      if (this.checkResizeHandle(mouseX, mouseY, annotation)) {
        this.currentAnnotation = annotation;
        this.isResizing = true;
        return;
      }
    }

    for (let annotation of this.annotations) {
      if (
        mouseX >= annotation.x &&
        mouseX <= annotation.x + annotation.w &&
        mouseY >= annotation.y &&
        mouseY <= annotation.y + annotation.h
      ) {
        this.currentAnnotation = annotation;
        this.isMoving = true;
        this.dragOffsetX = mouseX - annotation.x;
        this.dragOffsetY = mouseY - annotation.y;
        return;
      }
    }

    this.currentAnnotation = { x: mouseX, y: mouseY, w: 0, h: 0 };
    this.annotations.push(this.currentAnnotation);
    this.isDrawing = true;
  }

  checkResizeHandle(mouseX: number, mouseY: number, annotation: any): boolean {
    const half = this.resizeCornerSize / 2 / this.scale;

    if (
      mouseX >= annotation.x - half &&
      mouseX <= annotation.x + half &&
      mouseY >= annotation.y - half &&
      mouseY <= annotation.y + half
    ) {
      this.resizeHandle = 'top-left';
      return true;
    } else if (
      mouseX >= annotation.x + annotation.w - half &&
      mouseX <= annotation.x + annotation.w + half &&
      mouseY >= annotation.y - half &&
      mouseY <= annotation.y + half
    ) {
      this.resizeHandle = 'top-right';
      return true;
    } else if (
      mouseX >= annotation.x - half &&
      mouseX <= annotation.x + half &&
      mouseY >= annotation.y + annotation.h - half &&
      mouseY <= annotation.y + annotation.h + half
    ) {
      this.resizeHandle = 'bottom-left';
      return true;
    } else if (
      mouseX >= annotation.x + annotation.w - half &&
      mouseX <= annotation.x + annotation.w + half &&
      mouseY >= annotation.y + annotation.h - half &&
      mouseY <= annotation.y + annotation.h + half
    ) {
      this.resizeHandle = 'bottom-right';
      return true;
    } else if (
      mouseX >= annotation.x + annotation.w / 2 - half &&
      mouseX <= annotation.x + annotation.w / 2 + half &&
      mouseY >= annotation.y - half &&
      mouseY <= annotation.y + half
    ) {
      this.resizeHandle = 'top';
      return true;
    } else if (
      mouseX >= annotation.x + annotation.w / 2 - half &&
      mouseX <= annotation.x + annotation.w / 2 + half &&
      mouseY >= annotation.y + annotation.h - half &&
      mouseY <= annotation.y + annotation.h + half
    ) {
      this.resizeHandle = 'bottom';
      return true;
    } else if (
      mouseX >= annotation.x - half &&
      mouseX <= annotation.x + half &&
      mouseY >= annotation.y + annotation.h / 2 - half &&
      mouseY <= annotation.y + annotation.h / 2 + half
    ) {
      this.resizeHandle = 'left';
      return true;
    } else if (
      mouseX >= annotation.x + annotation.w - half &&
      mouseX <= annotation.x + annotation.w + half &&
      mouseY >= annotation.y + annotation.h / 2 - half &&
      mouseY <= annotation.y + annotation.h / 2 + half
    ) {
      this.resizeHandle = 'right';
      return true;
    }

    return false;
  }

  mouseMove(event: MouseEvent): void {
    const mouseX = (event.offsetX - this.translateX) / this.scale;
    const mouseY = (event.offsetY - this.translateY) / this.scale;

    if (this.isDrawing && this.currentAnnotation) {
      this.currentAnnotation.w = mouseX - this.currentAnnotation.x;
      this.currentAnnotation.h = mouseY - this.currentAnnotation.y;
      this.draw();
    } else if (this.isMoving && this.currentAnnotation) {
      this.currentAnnotation.x = mouseX - this.dragOffsetX;
      this.currentAnnotation.y = mouseY - this.dragOffsetY;
      this.draw();
    } else if (this.isResizing && this.currentAnnotation) {
      switch (this.resizeHandle) {
        case 'top-left':
          this.currentAnnotation.w += this.currentAnnotation.x - mouseX;
          this.currentAnnotation.h += this.currentAnnotation.y - mouseY;
          this.currentAnnotation.x = mouseX;
          this.currentAnnotation.y = mouseY;
          break;
        case 'top-right':
          this.currentAnnotation.w = mouseX - this.currentAnnotation.x;
          this.currentAnnotation.h += this.currentAnnotation.y - mouseY;
          this.currentAnnotation.y = mouseY;
          break;
        case 'bottom-left':
          this.currentAnnotation.w += this.currentAnnotation.x - mouseX;
          this.currentAnnotation.h = mouseY - this.currentAnnotation.y;
          this.currentAnnotation.x = mouseX;
          break;
        case 'bottom-right':
          this.currentAnnotation.w = mouseX - this.currentAnnotation.x;
          this.currentAnnotation.h = mouseY - this.currentAnnotation.y;
          break;
        case 'top':
          this.currentAnnotation.h += this.currentAnnotation.y - mouseY;
          this.currentAnnotation.y = mouseY;
          break;
        case 'bottom':
          this.currentAnnotation.h = mouseY - this.currentAnnotation.y;
          break;
        case 'left':
          this.currentAnnotation.w += this.currentAnnotation.x - mouseX;
          this.currentAnnotation.x = mouseX;
          break;
        case 'right':
          this.currentAnnotation.w = mouseX - this.currentAnnotation.x;
          break;
      }
      this.draw();
    }
  }

  mouseUp(): void {
    this.isDrawing = false;
    this.isMoving = false;
    this.isResizing = false;
    this.resizeHandle = null;
  }

  zoomIn(): void {
    this.scale = Math.min(this.scale + 0.1, this.maxScale);
    this.fitCanvasToWindow();
    this.draw();
  }

  zoomOut(): void {
    this.scale = Math.max(this.scale - 0.1, this.minScale);
    this.fitCanvasToWindow();
    this.draw();
  }
}
