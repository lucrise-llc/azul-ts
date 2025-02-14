/**
 * Test cards provided by Azul for testing purposes
 */
export const TEST_CARDS = {
  /**
   * Standard MasterCard test card
   */
  MASTERCARD_1: {
    number: '5424180279791732',
    expiration: '202812',
    cvv: '732'
  },

  /**
   * Standard Discover test card
   */
  DISCOVER: {
    number: '6011000990099818',
    expiration: '202812',
    cvv: '818'
  },

  /**
   * Standard Visa test card
   */
  VISA_1: {
    number: '4260550061845872',
    expiration: '202812',
    cvv: '872'
  },

  /**
   * Limited amount Visa test card
   * Maximum amount: RD$ 75
   */
  VISA_LIMITED: {
    number: '4005520000000129',
    expiration: '202812',
    cvv: '977',
    maxAmount: 75
  },

  /**
   * Standard MasterCard test card
   */
  MASTERCARD_2: {
    number: '5413330089600119',
    expiration: '202812',
    cvv: '979'
  },

  /**
   * Standard Visa test card
   */
  VISA_2: {
    number: '4012000033330026',
    expiration: '202812',
    cvv: '123'
  },

  /**
   * Standard Visa test card
   */
  VISA_TEST_CARD: {
    number: '4012000033330026',
    expiration: '202812',
    cvv: '123'
  }
} as const;
