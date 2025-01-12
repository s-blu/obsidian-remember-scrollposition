import { RememberScrollposition } from "../src/scrollposition"

describe('RememberScrollposition', () => {
  describe('saveScrollPosition', () => {
    it('should do nothing if app is invalid', () => {
      RememberScrollposition.saveScrollPosition(null, null, null)
    })
  })
})