export const Constants: Map<string, any> = new Map<string, any>([
  ["timeoutLimit", 800],
  ["voltageObjectStoreName", "voltageReadings"],
  ["temperatureObjectStoreName", "temperatureReadings"],
  ["uptimeObjectStoreName" , "uptime"],
  ["dataLimit" , 30],
  ["splashScreenDisplayTime" , 2000], 
])

export enum ChartTypeEnum {
  VOLTAGE = 'voltage',
  TEMPERATURE = 'temperature',
}

export const pagesThatALoggedInUserShouldNotAccess = new Set([
  '/login',
  '/registration',
])

export const pagesThatAGuestShouldNotAccess = new Set(
  [
    '/profile',
  ]
)

export enum AuthStatesEnum {
  UNKNOWN = 0,
  AUTHENTICATED = 1,
  UNAUTHENTICATED = 2,
}

