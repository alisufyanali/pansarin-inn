import AffiliateController from './AffiliateController'
import PayoutController from './PayoutController'
const Vendor = {
    AffiliateController: Object.assign(AffiliateController, AffiliateController),
PayoutController: Object.assign(PayoutController, PayoutController),
}

export default Vendor