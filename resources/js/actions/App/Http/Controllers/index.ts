import UserController from './UserController'
import Admin from './Admin'
import Vendor from './Vendor'
import Settings from './Settings'
const Controllers = {
    UserController: Object.assign(UserController, UserController),
Admin: Object.assign(Admin, Admin),
Vendor: Object.assign(Vendor, Vendor),
Settings: Object.assign(Settings, Settings),
}

export default Controllers