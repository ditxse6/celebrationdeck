// CelebrationDeck — Phase 1 resources (resource-group scoped).
// Static Web App (Standard) + Storage account (Blob + Table, Standard ZRS, Hot),
// per-prefix blob lifecycle rules, custom-auth provider app settings, and API
// app settings.
//
// SWA is on the STANDARD tier (~$9/mo, the only fixed cost): required for custom
// auth providers (Google + Microsoft), the rolesSource function, and linking a
// standalone Function App (BYOF) for heavy generation later. Everything else is
// consumption-billed and ~$0 at idle.

@description('Azure region for all resources.')
param location string

@description('Base name used to compose resource names.')
param baseName string = 'celebrationdeck'

@description('Region abbreviation used in resource names (e.g. cus).')
param regionAbbr string = 'cus'

@description('Short environment suffix (e.g. prod).')
param environmentName string = 'prod'

@description('Comma-separated Entra object IDs (oid claim) granted admin at login (bootstrap). Matched by the rolesSource function against the token objectidentifier claim.')
param adminEntraOid string = ''

@description('Application (client) ID of the Entra app registration used for Microsoft sign-in.')
param aadClientId string = ''

@description('Client secret for the Entra app registration. Keep only in the gitignored real params file.')
@secure()
param aadClientSecret string = ''

@description('Google OAuth client ID (from Google Cloud Console). Empty until configured.')
param googleClientId string = ''

@description('Google OAuth client secret. Keep only in the gitignored real params file. Empty until configured.')
@secure()
param googleClientSecret string = ''

// Table + container names (kept as vars so the API and infra agree).
var usersTableName = 'users'
var seasonsTableName = 'seasons'
var tournamentsTableName = 'tournaments'
var assetsContainerName = 'assets'

var swaName = '${baseName}-swa-${regionAbbr}-${environmentName}'
// Storage account names: 3-24 chars, lowercase alphanumeric only (no dashes).
var storageAccountName = toLower(replace('${baseName}st${regionAbbr}${environmentName}', '-', ''))

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    // Zone-redundant: 3 replicas across 3 availability zones in the region,
    // so data survives a single-AZ/datacenter failure. (SWA/Functions redundancy
    // is platform-managed and not configurable; Free tier carries no SLA.)
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource assetsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: assetsContainerName
  properties: {
    publicAccess: 'None'
  }
}

// Everything starts Hot. Auto-tier by asset type via leading-prefix rules
// (all tiers stay online/instant; never Archive). Prefix matches include the
// container name as the first segment.
//  - Season (global) assets, assets/seasons/*: Hot, then Cold at ~13 months.
//  - Tournament uploads, assets/users/*: Hot 30d -> Cool (90d) -> Cold at day 120.
//  - Generated decks (output), assets/outputs/*: Hot 7d -> Cold. Short Hot window
//      covers the near-immediate (fee-free) download; skips Cool to avoid its
//      30-day minimum-retention early-deletion fee.
resource lifecyclePolicy 'Microsoft.Storage/storageAccounts/managementPolicies@2023-05-01' = {
  parent: storage
  name: 'default'
  properties: {
    policy: {
      rules: [
        {
          name: 'season-assets-cold-13mo'
          enabled: true
          type: 'Lifecycle'
          definition: {
            filters: {
              blobTypes: [
                'blockBlob'
              ]
              prefixMatch: [
                '${assetsContainerName}/seasons/'
              ]
            }
            actions: {
              baseBlob: {
                // 13 months ~= 395 days.
                tierToCold: {
                  daysAfterModificationGreaterThan: 395
                }
              }
            }
          }
        }
        {
          name: 'tournament-uploads-hot-cool-cold'
          enabled: true
          type: 'Lifecycle'
          definition: {
            filters: {
              blobTypes: [
                'blockBlob'
              ]
              prefixMatch: [
                '${assetsContainerName}/users/'
              ]
            }
            actions: {
              baseBlob: {
                tierToCool: {
                  daysAfterModificationGreaterThan: 30
                }
                tierToCold: {
                  daysAfterModificationGreaterThan: 120
                }
              }
            }
          }
        }
        {
          name: 'generated-outputs-hot-then-cold'
          enabled: true
          type: 'Lifecycle'
          definition: {
            filters: {
              blobTypes: [
                'blockBlob'
              ]
              prefixMatch: [
                '${assetsContainerName}/outputs/'
              ]
            }
            actions: {
              baseBlob: {
                tierToCold: {
                  daysAfterModificationGreaterThan: 7
                }
              }
            }
          }
        }
      ]
    }
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource usersTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tableService
  name: usersTableName
}

resource seasonsTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tableService
  name: seasonsTableName
}

resource tournamentsTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tableService
  name: tournamentsTableName
}

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: swaName
  location: location
  sku: {
    // Standard: needed for custom auth providers, rolesSource, and BYOF.
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
  }
}

// Application settings exposed to the SWA-managed Functions API and referenced
// by staticwebapp.config.json for custom auth (clientIdSettingName / secret).
// The storage key is read at deploy time (listKeys) and never stored in source;
// provider client ids/secrets come from params (real values in the gitignored
// params file). NOTE: this resource is a full replace of app settings, so all
// values must be supplied here (don't set them out-of-band or a redeploy wipes them).
resource swaAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: swa
  name: 'appsettings'
  properties: {
    STORAGE_ACCOUNT_NAME: storage.name
    STORAGE_CONNECTION_STRING: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
    ASSETS_CONTAINER: assetsContainerName
    TABLE_USERS: usersTableName
    TABLE_SEASONS: seasonsTableName
    TABLE_TOURNAMENTS: tournamentsTableName
    ADMIN_ENTRA_OID: adminEntraOid
    AAD_CLIENT_ID: aadClientId
    AAD_CLIENT_SECRET: aadClientSecret
    GOOGLE_CLIENT_ID: googleClientId
    GOOGLE_CLIENT_SECRET: googleClientSecret
  }
}

output swaDefaultHostname string = swa.properties.defaultHostname
output swaName string = swa.name
output storageAccountName string = storage.name
