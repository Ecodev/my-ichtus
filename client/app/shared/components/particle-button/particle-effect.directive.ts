import {AfterContentInit, Directive, ElementRef, inject, Input, input, output, Renderer2} from '@angular/core';
import {rand} from './utils';
import {Direction, IOption, Particles} from './particles';
import type {EaseStringParamNames} from 'animejs';

@Directive({
    selector: '[appParticleEffect]',
})
export class ParticleEffectDirective implements AfterContentInit {
    private readonly renderer = inject(Renderer2);
    private readonly el = inject(ElementRef);

    private _particles: Particles | undefined;
    private _pHidden = false;
    public readonly pColor = input('#000');
    public readonly pDuration = input(1000);
    public readonly pEasing = input<EaseStringParamNames>('inOutCubic');
    public readonly pType = input('circle');
    public readonly pStyle = input('fill');
    public readonly pDirection = input<Direction>('left');
    public readonly pCanvasPadding = input(150);
    public readonly pOscillationCoefficient = input(30);
    public readonly pParticlesAmountCoefficient = input(3);
    public readonly pBegin = output();
    public readonly pComplete = output();
    public readonly pSize = input<(() => number) | number>(() => Math.floor(Math.random() * 3 + 1));
    public readonly pSpeed = input<(() => number) | number>(() => rand(4));

    @Input()
    public set pHidden(value: boolean) {
        this._pHidden = value;
        if (this._particles) {
            if (value && !this._particles.isDisintegrated()) {
                this._particles.disintegrate(this.getOptions());
            } else if (!value && this._particles.isDisintegrated()) {
                this._particles.integrate(this.getOptions());
            }
        }
    }

    public get pHidden(): boolean {
        return this._pHidden;
    }

    public ngAfterContentInit(): void {
        this._particles = new Particles(this.el.nativeElement, this.getOptions(), this.renderer);

        if (this._pHidden) {
            this._particles.disintegrate({duration: 0});
        }
    }

    private getOptions(): Required<IOption> {
        return {
            color: this.pColor(),
            type: this.pType(),
            style: this.pStyle(),
            canvasPadding: this.pCanvasPadding(),
            duration: this.pDuration(),
            easing: this.pEasing(),
            direction: this.pDirection(),
            size: this.pSize(),
            speed: this.pSpeed(),
            particlesAmountCoefficient: this.pParticlesAmountCoefficient(),
            oscillationCoefficient: this.pOscillationCoefficient(),
            begin: () => {
                this.pBegin.emit();
            },
            complete: () => {
                this.pComplete.emit();
            },
            width: null,
            height: null,
        };
    }
}
