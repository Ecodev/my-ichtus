import {AfterViewInit, Component, ContentChild, ElementRef, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';

@Component({
    selector: 'app-particle-switch',
    templateUrl: './particle-switch.component.html',
    styleUrls: ['./particle-switch.component.scss'],
})
export class ParticleSwitchComponent implements OnInit, AfterViewInit {
    @ContentChild(TemplateRef, {static: true}) public template!: TemplateRef<any>;
    @ViewChild('wrapper', {static: true}) private wrapper!: ElementRef<any>;

    public _data1: any;
    public _data2: any;
    public showData1 = false;
    public showData2 = false;
    public invertAnimation = false;
    public duration = 500;
    public firstDisplay = true;

    public settings1 = {
        pOscillationCoefficient: 80,
        pDirection: 'right',
        pColor: 'red',
        pParticlesAmountCoefficient: 1,
        pDuration: this.duration,
        pSpeed: 0.5,
    };

    public settings2 = {
        pOscillationCoefficient: 100,
        pDirection: 'left',
        pColor: 'green',
        pParticlesAmountCoefficient: 1,
        pDuration: this.duration,
        pSpeed: 0.5,
    };

    @Input() set data(value: any) {
        if (!this.showData1) {
            this._data1 = value;
            this.showData2 = false;
            if (this.firstDisplay) {
                this.showData1 = true;
            } else {
                setTimeout(() => (this.showData1 = true), this.duration - 100);
            }
            this.invertAnimation = false;
        } else {
            this._data2 = value;
            this.showData1 = false;
            setTimeout(() => (this.showData2 = true), this.duration - 100);
            this.invertAnimation = true;
        }

        const tmpSettings = this.settings1;
        this.settings1 = this.settings2;
        this.settings2 = tmpSettings;

        this.updateSize();
        this.firstDisplay = false;
    }

    constructor(private readonly rootElement: ElementRef) {}

    public ngOnInit(): void {}

    public ngAfterViewInit(): void {
        this.updateSize();
    }

    private updateSize(): void {
        const root = this.rootElement.nativeElement;
        const child = this.wrapper.nativeElement.children[0];
        root.style.height = child.offsetHeight + 'px';
        root.style.width = child.offsetWidth + 'px';
    }
}
