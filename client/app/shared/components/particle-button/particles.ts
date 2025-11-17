import type {animate, Callback, EaseStringParamNames, JSAnimation} from 'animejs';
import {Renderer2} from '@angular/core';
import {rand} from './utils';

export type Direction = 'left' | 'top' | 'right';

export type IOption = {
    color?: string;
    type?: string;
    style?: string;
    canvasPadding?: number;
    duration?: number;
    easing?: EaseStringParamNames;
    direction?: Direction;
    size?: (() => number) | number;
    speed?: (() => number) | number;
    particlesAmountCoefficient?: number;
    oscillationCoefficient?: number;
    width?: number | null;
    height?: number | null;
    begin?: () => void;
    complete?: () => void;
};

type Particle = {
    startX: number;
    startY: number;
    x: number;
    y: number;
    angle: number;
    counter: number;
    increase: number;
    life: number;
    death: number;
    speed: number;
    size: number;
};

export class Particles {
    private particles: Particle[] = [];
    private frame: number | null = null;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private wrapper: HTMLDivElement;
    private parentWrapper: HTMLDivElement;
    private disintegrating = false;
    private width = 0;
    private height = 0;
    private lastProgress: number | undefined;
    private rect: HTMLCanvasElement | undefined;
    private options: Required<IOption>;
    private o: Required<IOption>;
    private anime: Promise<typeof animate> | undefined;

    public constructor(
        private readonly el: any,
        options: Required<IOption>,
        private readonly renderer: Renderer2,
    ) {
        this.options = {...options};
        this.o = {...options};
        this.canvas = this.renderer.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.renderer.setStyle(this.canvas, 'position', 'absolute');
        this.renderer.setStyle(this.canvas, 'pointerEvents', 'none');
        this.renderer.setStyle(this.canvas, 'top', '50%');
        this.renderer.setStyle(this.canvas, 'left', '50%');
        this.renderer.setStyle(this.canvas, 'transform', 'translate3d(-50%, -50%, 0)');
        this.renderer.setStyle(this.canvas, 'display', 'none');
        this.wrapper = this.renderer.createElement('div');
        this.renderer.setStyle(this.wrapper, 'position', 'relative');
        this.renderer.setStyle(this.wrapper, 'display', 'inline-block');
        this.renderer.setStyle(this.wrapper, 'overflow', 'hidden');
        this.renderer.insertBefore(this.el.parentNode, this.wrapper, this.el);
        this.renderer.appendChild(this.wrapper, this.el);
        this.parentWrapper = this.renderer.createElement('div');
        this.renderer.setStyle(this.parentWrapper, 'position', 'relative');
        this.renderer.setStyle(this.parentWrapper, 'display', 'inline-block');
        this.renderer.insertBefore(this.wrapper.parentNode, this.parentWrapper, this.wrapper);
        this.renderer.appendChild(this.parentWrapper, this.wrapper);
        this.renderer.appendChild(this.parentWrapper, this.canvas);
    }

    private loop(): void {
        this.updateParticles();
        this.renderParticles();
        if (this.isAnimating()) {
            this.frame = requestAnimationFrame(this.loop.bind(this));
        }
    }

    private updateParticles(): void {
        let p;
        for (let i = 0; i < this.particles.length; i++) {
            p = this.particles[i];
            if (p.life > p.death) {
                this.particles.splice(i, 1);
            } else {
                p.x += p.speed;
                p.y = this.o.oscillationCoefficient * Math.sin(p.counter * p.increase);
                p.life++;
                p.counter += this.disintegrating ? 1 : -1;
            }
        }
        if (!this.particles.length) {
            this.pause();
            this.renderer.setStyle(this.canvas, 'display', 'none');
            this.o.complete();
        }
    }

    private renderParticles(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
        let p;
        for (const item of this.particles) {
            p = item;
            if (p.life < p.death) {
                this.ctx.translate(p.startX, p.startY);
                this.ctx.rotate((p.angle * Math.PI) / 180);
                this.ctx.globalAlpha = this.disintegrating ? 1 - p.life / p.death : p.life / p.death;
                this.ctx.fillStyle = this.ctx.strokeStyle = this.o.color;
                this.ctx.beginPath();

                if (this.o.type === 'circle') {
                    this.ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
                } else if (this.o.type === 'triangle') {
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p.x + p.size, p.y + p.size);
                    this.ctx.lineTo(p.x + p.size, p.y - p.size);
                } else if (this.o.type === 'rectangle') {
                    this.ctx.rect(p.x, p.y, p.size, p.size);
                }

                if (this.o.style === 'fill') {
                    this.ctx.fill();
                } else if (this.o.style === 'stroke') {
                    this.ctx.closePath();
                    this.ctx.stroke();
                }

                this.ctx.globalAlpha = 1;
                this.ctx.rotate((-p.angle * Math.PI) / 180);
                this.ctx.translate(-p.startX, -p.startY);
            }
        }
    }

    private play(): void {
        this.frame = requestAnimationFrame(this.loop.bind(this));
    }

    private pause(): void {
        cancelAnimationFrame(this.frame!);
        this.frame = null;
    }

    private addParticle(x: number, y: number): void {
        const frames = (this.o.duration * 60) / 1000;
        const speed: number = typeof this.o.speed === 'function' ? this.o.speed() : this.o.speed;
        this.particles.push({
            startX: x,
            startY: y,
            x: this.disintegrating ? 0 : speed * -frames,
            y: 0,
            angle: rand(360),
            counter: this.disintegrating ? 0 : frames,
            increase: (Math.PI * 2) / 100,
            life: 0,
            death: this.disintegrating ? frames - 20 + Math.random() * 40 : frames,
            speed: speed,
            size: typeof this.o.size === 'function' ? this.o.size() : this.o.size,
        });
    }

    private addParticles(rect: HTMLCanvasElement, progress: number): void {
        const progressDiff = this.disintegrating ? progress - this.lastProgress! : this.lastProgress! - progress;
        this.lastProgress = progress;
        let x = this.options.canvasPadding;
        let y = this.options.canvasPadding;
        const progressValue =
            (this.isHorizontal() ? rect.width : rect.height) * progress +
            progressDiff * (this.disintegrating ? 100 : 220);
        if (this.isHorizontal()) {
            x += this.o.direction === 'left' ? progressValue : rect.width - progressValue;
        } else {
            y += this.o.direction === 'top' ? progressValue : rect.height - progressValue;
        }
        let i = Math.floor(this.o.particlesAmountCoefficient * (progressDiff * 100 + 1));
        if (i > 0) {
            while (i--) {
                this.addParticle(
                    x + (this.isHorizontal() ? 0 : rect.width * Math.random()),
                    y + (this.isHorizontal() ? rect.height * Math.random() : 0),
                );
            }
        }
        if (!this.isAnimating()) {
            this.renderer.setStyle(this.canvas, 'display', 'block');
            this.play();
        }
    }

    private addTransforms(value: any): void {
        const translateProperty = this.isHorizontal() ? 'translateX' : 'translateY';
        const translateValue = this.o?.direction === 'left' || this.o?.direction === 'top' ? value : -value;
        this.renderer.setStyle(this.wrapper, 'transform', `${translateProperty}(${translateValue}%)`);
        this.renderer.setStyle(this.el, 'transform', `${translateProperty}(${-translateValue}%)`);
    }

    public disintegrate(options: IOption = {}): void {
        if (!this.isAnimating()) {
            this.disintegrating = true;
            this.lastProgress = 0;
            this.setup(options);
            this.animate(anim => {
                const value = (anim.targets[0] as any).value;
                this.addTransforms(value);
                if (this.o.duration) {
                    this.addParticles(this.rect!, value / 100);
                }
            });
        }
    }

    public integrate(options: IOption = {}): void {
        if (!this.isAnimating()) {
            this.disintegrating = false;
            this.lastProgress = 1;
            this.setup(options);
            this.animate(anim => {
                const value = (anim.targets[0] as any).value;
                setTimeout(() => {
                    this.addTransforms(value);
                }, this.o.duration);
                if (this.o.duration) {
                    this.addParticles(this.rect!, value / 100);
                }
            });
        }
    }

    private setup(options: IOption): void {
        this.o = {...this.options, ...options};
        this.renderer.setStyle(this.wrapper, 'visibility', 'visible');
        if (this.o.duration) {
            this.rect = this.el.getBoundingClientRect();
            this.width = this.canvas.width = this.o.width || this.rect!.width + this.o.canvasPadding * 2;
            this.height = this.canvas.height = this.o.height || this.rect!.height + this.o.canvasPadding * 2;
        }
    }

    public isDisintegrated(): boolean {
        return this.disintegrating;
    }

    private animate(update: Callback<JSAnimation>): void {
        this.anime ??= import('animejs').then(m => m.animate);
        this.anime.then(anime => {
            anime(
                {value: this.disintegrating ? 0 : 100},
                {
                    value: this.disintegrating ? 100 : 0,
                    duration: this.o.duration,
                    ease: this.o.easing,
                    begin: this.o.begin,
                    onUpdate: update,
                    onComplete: () => {
                        if (this.disintegrating) {
                            this.renderer.setStyle(this.wrapper, 'visibility', 'hidden');
                        }
                    },
                },
            );
        });
    }

    private isAnimating(): boolean {
        return !!this.frame;
    }

    private isHorizontal(): boolean {
        return this.o?.direction === 'left' || this.o?.direction === 'right';
    }
}
