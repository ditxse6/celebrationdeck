// CelebrationDeck — Phase 1 resources (resource-group scoped).
// Static Web App (Free) + Storage account (Blob + Table, Standard LRS, Cool),
// with a lifecycle rule to tier blobs to Cold after 90 days, and API app settings.

@description('Azure region for all resources.')
param location string

@description('Base name used to compose resource names.')
param baseName string = 'celebrationdeck'

@description('Region abbreviation used in resource names (e.g. cus).')
param regionAbbr string = 'cus'

@description('Short environment suffix (e.g. prod).')
param environmentName string = 'prod'

@description('Comma-separated Entra object IDs granted admin at login (bootstrap).')
@secure()
param adminUserIds string = ''

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
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Cool'
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

// Tier blobs to Cold after ~90 days (still online/instant; avoids Archive rehydration).
resource lifecyclePolicy 'Microsoft.Storage/storageAccounts/managementPolicies@2023-05-01' = {
  parent: storage
  name: 'default'
  properties: {
    policy: {
      rules: [
        {
          name: 'tier-to-cold-after-90d'
          enabled: true
          type: 'Lifecycle'
          definition: {
            filters: {
              blobTypes: [
                'blockBlob'
              ]
            }
            actions: {
              baseBlob: {
                tierToCold: {
                  daysAfterModificationGreaterThan: 90
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
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
  }
}

// Application settings exposed to the SWA-managed Functions API.
// The storage key is read at deploy time (listKeys) and never stored in source.
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
    ADMIN_USER_IDS: adminUserIds
  }
}

output swaDefaultHostname string = swa.properties.defaultHostname
output swaName string = swa.name
output storageAccountName string = storage.name
