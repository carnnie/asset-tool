import { user } from './App'

export const permissions = {
    ItInvent: ['MCC_RU_INSIGHT_IT_ROLE', 'MCC_RU_INSIGHT_IT_INVENTADMIN_ROLE'],
    Printers: ['MCC_RU_INSIGHT_IT_INVENTADMIN_ROLE'],
    Mobile: ["MCC_RU_INSUGHT_IT_ROLE", "MCC_RU_INSIGHT_STORE_ROLE"],
    ItStorage: ['MCC_RU_INSIGHT_IT_STORAGE_ROLE'],
}

export const checkPermission = (user: user, roles: Array<string>) => {
    return user.roles.some((role) => roles.includes(role))
}
