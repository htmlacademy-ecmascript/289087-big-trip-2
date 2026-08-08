import ApiService from '../framework/api-service.js';

export default class OffersApiService extends ApiService {
  // getOffers()
  get offers() {
    return this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }
}
