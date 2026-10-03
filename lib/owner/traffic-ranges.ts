// Day windows the dashboard's traffic picker offers. Lives outside the client
// component so the server page can validate ?range= against it — values
// exported from a "use client" module arrive on the server as client
// references, not the array.
export const TRAFFIC_RANGES = [7, 30, 90] as const
