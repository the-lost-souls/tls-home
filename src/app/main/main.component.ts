import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CarouselConfig } from '../carouselconfig';
import { Utils } from '../utils';
import { Layout } from '../layout';
import { CarouselUtils } from '../carouselutils';
import { Flare } from '../flare';
import { CarouselService } from '../carousel.service';
import { FlaresService } from '../flares.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  animations: [
    trigger('showHideContent', [
      state('true', style({
        opacity: '1',
      })),
      state('false', style({
        opacity: '0',
      })),
      transition('false => true', [
        animate('1s 0.5s ease-out')
      ]),
      transition('true => false', [
        animate('0.5s ease-in')
      ])
    ])
  ]
})
export class MainComponent implements OnInit, AfterViewInit {

  // inputs
  public config: CarouselConfig = CarouselConfig.default();

  // -------------
  public itemTotalSize = this.config.itemSize + this.config.spacing;

  public angle1 = 0;
  public angle2 = -63;

  @ViewChild('carousel', { static: false })
  private _carousel: ElementRef<HTMLElement>;

  public itemSizeStyle: string;

  public scrollPaddingTop: string;
  public scrollPaddingBottom: string;
  public layout: Layout[] = [];

  public margins: string[] = [];

  private _previousT: number;
  private _previousScrollTop: number;

  public flares = [
    new Flare(-this.config.contentWidth, 80, this.config.spacing, 1.5),
    new Flare(this.config.contentWidth, this.config.center + this.itemTotalSize * this.config.grow * 0.5, this.config.spacing, 1.2),
    new Flare(-this.config.contentWidth / 2, this.config.center + this.itemTotalSize * this.config.grow, this.config.spacing, 1)
  ];

  constructor(
    private _carouselService: CarouselService, 
    private _changeDetector: ChangeDetectorRef,
    private _sanitizer: DomSanitizer,
    private _flaresService: FlaresService) {

    this.layout = new Array(this.config.sections.length);
    for (let i = 0; i < this.layout.length; i++) {
      this.layout[i] = new Layout();
    }
  }

  ngOnInit() {
    this.itemSizeStyle = `${this.config.itemSize}px`;
  }

  ngAfterViewInit() {
    // On safari, using container.clientHeight gives the wrong value, for some reason
    const viewportHeight = window.innerHeight;

    this.margins = new Array(this.config.sections.length);
    this.margins[0] = `${this.config.center - this.config.itemSize / 2}px 0 0 0`;
    for (let i = 1; i < this.config.sections.length - 1; i++) {
      this.margins[i] = `${this.config.spacing}px 0 0 0`;
    }
    this.margins[this.config.sections.length - 1] =
      `${this.config.spacing}px 0 ${viewportHeight - this.config.center - this.config.itemSize / 2}px 0`;

    this.scrollPaddingTop = `${this.config.center - this.itemTotalSize / 2}px`;
    this.scrollPaddingBottom = `${viewportHeight - this.config.center - this.itemTotalSize / 2}px`;


    for (let i = 0; i < this.config.sections.length; i++) {

      this.layout[i].virtualCenter = this.config.center + this.itemTotalSize * i;
      this.layout[i].virtualTop = this.layout[i].virtualCenter - this.config.itemSize / 2;
      this.layout[i].virtualTopStyle = this.layout[i].virtualTop + 'px';
    }

    const c = document.createElement('canvas');
    for (let i = 0; i < this.config.sections.length; i++) {
      const img = new Image();
      img.onload = () => {
        console.log('Blurring ' + this.config.sections[i].image);
        this.layout[i].background = Utils.prepareBackground(img, c, this.config.blurRadius, this.config.backgroundFadeRadius);
        this.layout[i].foreground = Utils.fadeEdges(img, c, 0, 640);
      };
      img.src = this.config.sections[i].image;
    }

    this._changeDetector.detectChanges();

    requestAnimationFrame((frameT) => this.animate(frameT));
  }

  private animate(t: number) {

    if (this._previousT) {
      const elapsed = t - this._previousT;
      // this.angle1 += 3.5 * elapsed / 1000;
    }

    const scrollTop = this._carousel.nativeElement.scrollTop;

    if (scrollTop !== this._previousScrollTop) {
      this._carouselService.handleScroll(this.layout, this.config, this._carousel.nativeElement.scrollTop);

      this._flaresService.updateFlares(scrollTop, this.layout, this.flares, this.config, this._sanitizer);
      this._carouselService.updateTransforms(this.layout, this.config, this._sanitizer, this.angle1);
    }
    this._previousScrollTop = scrollTop;
    this._previousT = t;
    requestAnimationFrame((frameT) => this.animate(frameT));
  }

}
