export enum ConstantsEnum {
  timeoutLimit = 800,
  voltageObjectStoreName = "voltageReadings",
  temperatureObjectStoreName = "temperatureReadings",
  uptimeObjectStoreName = "uptime",
  dataLimit = 30,
  splashScreenDisplayTime = 2000, 

}


export enum ChartTypeEnum {
  VOLTAGE = 0,
  TEMPERATURE = 1,
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

