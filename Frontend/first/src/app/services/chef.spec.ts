import { TestBed } from '@angular/core/testing';

import { Chef } from './chef';

describe('Chef', () => {
  let service: Chef;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Chef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
