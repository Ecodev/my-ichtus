import {AfterContentInit, Directive, ElementRef, EventEmitter, inject, Input, Output, Renderer2} from '@angular/core';
import {rand} from './utils';
import {Direction, IOption, Particles} from './particles';
import type {EaseStringParamNames} from 'animejs';

@Directive({
    selector: '[appParticleEffect]',
    standalone: true,
})
export class ParticleEffectDirective implements AfterContentInit {
    private readonly renderer = inject(Renderer2);
    private readonly el = inject(ElementRef);

    private _particles: Particles | undefined;
    private _pHidden = false;
    @Input() public pColor = '#000';
    @Input() public pDuration = 1000;
    @Input() public pEasing: EaseStringParamNames = 'inOutCubic';
    @Input() public pType = 'circle';
    @Input() public pStyle = 'fill';
    @Input() public pDirection: Direction = 'left';
    @Input() public pCanvasPadding = 150;
    @Input() public pOscillationCoefficient = 30;
    @Input() public pParticlesAmountCoefficient = 3;
    @Output() public readonly pBegin = new EventEmitter<void>();
    @Output() public readonly pComplete = new EventEmitter<void>();
    @Input() public pSize: (() => number) | number = () => Math.floor(Math.random() * 3 + 1);
    @Input() public pSpeed: (() => number) | number = () => rand(4);

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
            color: this.pColor,
            type: this.pType,
            style: this.pStyle,
            canvasPadding: this.pCanvasPadding,
            duration: this.pDuration,
            easing: this.pEasing,
            direction: this.pDirection,
            size: this.pSize,
            speed: this.pSpeed,
            particlesAmountCoefficient: this.pParticlesAmountCoefficient,
            oscillationCoefficient: this.pOscillationCoefficient,
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
