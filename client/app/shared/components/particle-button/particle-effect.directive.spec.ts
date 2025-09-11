import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement, InputSignal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ParticleEffectDirective} from './particle-effect.directive';
import {ConditionalPick} from 'type-fest';
import type {EaseStringParamNames} from 'animejs';
import {Direction} from './particles';

@Component({
    imports: [ParticleEffectDirective],
    template: ` <button appParticleEffect (click)="hidden0 = !hidden0">Send</button> `,
})
class TestParticleEffectButtonComponent {
    public hidden0 = false;
}

type PossibleInputName = keyof ConditionalPick<
    ParticleEffectDirective,
    InputSignal<string> | InputSignal<number> | InputSignal<EaseStringParamNames> | InputSignal<Direction>
>;
type PossibleInputs = Partial<Record<PossibleInputName, string | number>>;

describe('AngularParticleEffectButtonComponent', () => {
    let component: TestParticleEffectButtonComponent;
    let fixture: ComponentFixture<TestParticleEffectButtonComponent>;
    let directiveDOM: DebugElement;
    let directiveChildWrapper: DebugElement;
    let directiveParentWrapper: DebugElement;
    let canvas: DebugElement[];
    let originalTimeout: number;

    const defaultOptions: PossibleInputs = {
        pColor: '#000',
        pDuration: 1000,
        pEasing: 'inOutCubic',
        pType: 'circle',
        pStyle: 'fill',
        pDirection: 'left',
        pCanvasPadding: 150,
        pOscillationCoefficient: 30,
        pParticlesAmountCoefficient: 3,
    } as const;

    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        TestBed.configureTestingModule({});
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestParticleEffectButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        directiveDOM = fixture.debugElement.query(By.directive(ParticleEffectDirective));
        directiveChildWrapper = directiveDOM.parent!;
        directiveParentWrapper = directiveChildWrapper.parent!;
        canvas = directiveParentWrapper.queryAll(By.css('canvas'));
    });

    it('should create directive', () => {
        expect(directiveDOM).toBeTruthy();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should have a child wrapper containing the original button with proper styles', () => {
        expect(directiveChildWrapper).toBeTruthy();
        expect(directiveChildWrapper.styles.position).toEqual('relative');
        expect(directiveChildWrapper.styles.display).toEqual('inline-block');
        expect(directiveChildWrapper.styles.overflow).toEqual('hidden');
    });

    it('should have a parent wrapper containing the child wrapper and a canvas with proper styles', () => {
        expect(directiveParentWrapper).toBeTruthy();
        expect(directiveParentWrapper.styles.position).toEqual('relative');
        expect(directiveParentWrapper.styles.display).toEqual('inline-block');
    });

    it('should have a canva with proper styles', () => {
        expect(canvas.length).toBe(1);

        const styles = canvas[0].styles;
        expect(styles.position).toEqual('absolute');
        expect(styles['pointer-events']).toEqual('none');
        expect(styles.top).toEqual('50%');
        expect(styles.left).toEqual('50%');
        expect(styles.transform).toEqual('translate3d(-50%, -50%, 0px)');
        expect(styles.display).toEqual('none');
    });

    it('should have default values already set', () => {
        const directiveInstance = directiveDOM.injector.get(ParticleEffectDirective);
        Object.keys(defaultOptions).forEach(key => {
            expect(defaultOptions[key as PossibleInputName]).toEqual(directiveInstance[key as PossibleInputName]());
        });
    });

    it('should begin event emit when animation starts', done => {
        const directiveInstance = directiveDOM.injector.get(ParticleEffectDirective);
        directiveInstance.pBegin.subscribe(() => {
            expect(true).toBe(true);
            done();
        });
        directiveInstance.pHidden = true;
        fixture.detectChanges();
    });

    it('should complete event emit when animation completes', done => {
        const directiveInstance = directiveDOM.injector.get(ParticleEffectDirective);
        directiveInstance.pComplete.subscribe(() => {
            expect(true).toBe(true);
            done();
        });
        directiveInstance.pHidden = true;
        fixture.detectChanges();
    });
});
