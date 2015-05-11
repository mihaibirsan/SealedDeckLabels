/* global describe, it, expect */

(function () {
  'use strict';

  /* global pageDistribution */
  describe('pageDistribution', function () {
      it('should distribute items to pages', function () {
          expect(pageDistribution(7, 3)).to.deep.equal([ [ 0, 3, 6 ], [ 1, 4 ], [ 2, 5 ] ]);
          expect(pageDistribution(12, 10)).to.deep.equal([ [ 0, 2, 4, 6, 8, 10 ], [ 1, 3, 5, 7, 9, 11 ] ]);
      });
      it('should distribute items to pages with grouping', function () {
          expect(pageDistribution(12, 10, 2)).to.deep.equal([ [ 0, 1, 4, 5, 8, 9 ], [ 2, 3, 6, 7, 10, 11 ] ]);
      });
  });
})();
