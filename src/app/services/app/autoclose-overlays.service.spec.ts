import { TestBed } from '@angular/core/testing';

import { AutocloseOverlaysService } from './autoclose-overlays.service';

describe('AutocloseOverlaysService', () => {
  let service: AutocloseOverlaysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutocloseOverlaysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
