import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CarouselSection } from '../carouselsection';
import { CarouselOptions } from '../carouseloptions';
import { Utils } from '../utils';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import * as IsMobile from 'is-mobile';
import { distinctUntilChanged } from 'rxjs/operators';
import { SimpleAnimator } from '../simpleanimator';

@Component({
  selector: 'app-carousel-section',
  templateUrl: './carousel-section.component.html',
  styleUrls: ['./carousel-section.component.sass']
})
export class CarouselSectionComponent implements OnInit {

  @Input()
  content: CarouselSection;

  @Input()
  backgroundTransform: SafeStyle;

  @Input()
  options: CarouselOptions;

  @Output()
  public loaded: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public linkClicked: EventEmitter<void> = new EventEmitter<void>();

  private _focus = 0;
  @Input()
  public set focus(value: number) {
    this._focus = value;
    this.focusChanged.next(value);
  }

  public get focus(): number {
    return this._focus;
  }

  private focusChanged: EventEmitter<number> = new EventEmitter<number>();

  public foregroundImage: string;
  public backgroundImage: string;
  public contentTransform: SafeStyle;
  public contentWidth: number;
  public contentHeight: number;
  public opacity = 0;

  public style = IsMobile.isMobile(navigator.userAgent) ?
  {
    titleFontSize: 15,
    eventFontSize: 8,
    nameFontSize: 11,
    roleFontSize: 8,
  } : {
    titleFontSize: 24,
    eventFontSize: 11,
    nameFontSize: 15,
    roleFontSize: 11,
  };

  // Would love to use Angular animations here, but using angular to animate opacity causes weird bouncing
  // effect when scrolling on ios webkit.
  private _animateOpacity: SimpleAnimator = new SimpleAnimator(false, 1, 0, 0.7, 0.4, (opacity) => this.opacity = opacity);

  constructor(private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    const image = new Image();
    const canvas = document.createElement('canvas');
    image.onload = () => {
      this.backgroundImage = Utils.prepareBackground(image, canvas, this.options.blurRadius, this.options.backgroundFadeRadius);
      this.foregroundImage = Utils.fadeEdges(image, canvas, 0, 640);
      this.loaded.next(true);
    };
    image.src = this.content.image;

    this.contentWidth = this.options.contentWidth * this.options.grow;
    this.contentHeight = (this.options.sectionHeight - this.options.padding * 2) * this.options.grow;
    this.contentTransform =
      this._sanitizer.bypassSecurityTrustStyle(`translateX(-50%) translateY(-50%) translateZ(2em) scale(${1 / this.options.grow}) `);

    this.focusChanged
      .pipe(distinctUntilChanged())
      .subscribe(value => this._animateOpacity.state = (value === 1));
  }
}
