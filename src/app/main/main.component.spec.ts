import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainComponent } from './main.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SuffixPipe } from '../suffix.pipe';
import { CarouselSectionComponent } from '../carousel-section/carousel-section.component';
import { LensflareComponent } from '../lensflare/lensflare.component';
import { RouterTestingModule } from '@angular/router/testing';
import { GoodbyeComponentComponent } from '../goodbye-component/goodbye-component.component';
import { ActionComponent } from '../action/action.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{ path: '', component: MainComponent }]
        ),
        NoopAnimationsModule
      ],
      declarations: [
        MainComponent,
        SuffixPipe,
        CarouselSectionComponent,
        LensflareComponent,
        GoodbyeComponentComponent,
        ActionComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
