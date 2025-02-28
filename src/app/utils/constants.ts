export enum ConstantsEnum {
  timeoutLimit = 800,
  voltageObjectStoreName = "voltageReadings",
  temperatureObjectStoreName = "temperatureReadings",
  uptimeObjectStoreName = "uptime",
  dataLimit = 30,
  splashScreenDisplayTime = 2000, 

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
  unknown = 0,
  authenticated = 1,
  unauthenticated = 2,
}

