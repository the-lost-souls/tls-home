import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, QueryList, ViewChildren } from '@angular/core';
import { CarouselOptions } from '../carouseloptions';
import { Layout } from '../layout';
import { CarouselService } from '../carousel.service';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { GoodbyeComponentComponent } from '../goodbye-component/goodbye-component.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LensflareComponent } from '../lensflare/lensflare.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  animations: [
    trigger('fadeIn', [
      state('void, false', style({
        opacity : 0
      })),
      state('true', style({
        opacity: 1,
      })),
      transition('* => true', [
        animate('0.7s')
      ]),
      transition('* => false', [
        animate('0.2s')
      ]),
    ]),
  ]
})
export class MainComponent implements OnInit, AfterViewInit {

  // inputs
  public options: CarouselOptions = CarouselOptions.default();

  // -------------
  public sectionContentHeight = this.options.sectionHeight - this.options.padding * 2;

  public backgroundAngle = 0;
  public backgroundScale = 1;

  @ViewChild('carousel', { static: false })
  private _carousel: ElementRef<HTMLElement>;

  @ViewChild(GoodbyeComponentComponent, { static: false })
  public goodbye: GoodbyeComponentComponent;

  @ViewChildren(LensflareComponent)
  private _lensFlares: QueryList<LensflareComponent>;

  public scrollPaddingTop: string;
  public scrollPaddingBottom: string;
  public layout: Layout[] = [];
  public polygons: [number, number][][];

  public loadingProgress = 0;
  public sectionsLoaded = 0;
  public loaded = false;
  public isAtTop = false;
  public isAtBottom = false;

  public showCenter = false;
  public animateBackground = true;

  private _previousScrollTop: number;

  public flares = CarouselOptions.flares(this.options);

  constructor(
    private _carouselService: CarouselService,
    private _changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute) {

    this.layout = new Array(this.options.sections.length);
    for (let i = 0; i < this.layout.length; i++) {
      this.layout[i] = new Layout();
    }
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;

    this.showCenter = this.getBooleanOrDefault(params, 'showcenter', false);
    this.animateBackground = this.getBooleanOrDefault(params, 'animatebackground', true);
  }

  ngAfterViewInit() {
    // On safari, using container.clientHeight gives the wrong value, for some reason
    const viewportHeight = window.innerHeight;

    this.scrollPaddingTop = `${this.options.center - this.options.sectionHeight / 2}px`;
    this.scrollPaddingBottom = `${viewportHeight - this.options.center - this.options.sectionHeight / 2}px`;

    for (let i = 0; i < this.options.sections.length; i++) {
      this.layout[i].virtualCenter = this.options.center + this.options.sectionHeight * i;
      this.layout[i].virtualTop = this.layout[i].virtualCenter - this.options.sectionHeight / 2;
      this.layout[i].virtualTopStyle = this.layout[i].virtualTop + 'px';
    }

    this._changeDetector.detectChanges();

    requestAnimationFrame((frameT) => this.animate(frameT));
  }

  private animate(t: number) {
    const scrollTop = this._carousel.nativeElement.scrollTop;

    const width = this._carousel.nativeElement.clientWidth;
    const height = this.options.sectionHeight * this.options.grow;

    const k = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    const backgroundScale = 1.3 * k / 256; // add 20% to compensate for parralax


    this.isAtTop = this.layout[0].distance <= 0;
    this.isAtBottom = this.layout[this.layout.length - 1].distance >= 0;

    if (scrollTop !== this._previousScrollTop) {
      this._carouselService.handleScroll(this.layout, this.options, this._carousel.nativeElement.scrollTop);

      this._carouselService.updateTransforms(this.layout, this.options, this.backgroundAngle);
      this._carouselService.updateBackgroundTransforms(
        this.layout,
        this.options,
        this.backgroundAngle,
        backgroundScale + this.backgroundScale);
      this.polygons = this._carouselService.getPolygons(this.layout, this.options, scrollTop);
    }

    if (this.animateBackground) {
      this.backgroundAngle = t * 3.6 / 1000;
      this.backgroundScale = Math.cos(t / 3000) + 1;

      this._carouselService.updateBackgroundTransforms(
        this.layout,
        this.options,
        this.backgroundAngle,
        backgroundScale + this.backgroundScale);
    }

    this._previousScrollTop = scrollTop;
    requestAnimationFrame((frameT) => this.animate(frameT));
  }

  private getBooleanOrDefault(map: ParamMap, key: string, defaultValue: boolean): boolean {
    if (!map.has(key)) {
      return defaultValue;
    }

    return map.get(key) === 'true';
  }

  public onSectionLoaded(): void {
    this.sectionsLoaded++;
    this.loadingProgress = this.sectionsLoaded / this.options.sections.length;
    if (this.sectionsLoaded === this.options.sections.length) {
      this.loaded = true;
      setTimeout(() => {
          for (const lensFlare of this._lensFlares.toArray()) {
            lensFlare.fadeIn();
          }
        },
        0);
    }
  }

  public mailTo(): string {
    return 'torbjorv+thelostsouls';
  }
}
