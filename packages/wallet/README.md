# @llw/wallet

Server-only Apple/Google wallet pass helpers. **Never import into client or Expo
code** — it handles signing secrets.

Wallet features stay dark until credentials are set (`isGoogleWalletConfigured()`
/ `isAppleWalletConfigured()`), so the app runs fine without them.

## Google Wallet

Needs a service account with the *Wallet Object Issuer* role:

```
GOOGLE_WALLET_ISSUER_ID=
GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL=
GOOGLE_WALLET_PRIVATE_KEY=          # PEM; escaped \n are unescaped at runtime
GOOGLE_WALLET_ORIGINS=http://localhost:3000,https://yourdomain.com
```

- `createGoogleSaveUrl()` — a signed JWT "Save to Google Wallet" link. The class +
  object are created on the device when the customer taps save (no REST call).
- `patchGoogleObject()` — updates points/text after a stamp/redeem (OAuth token
  obtained via a service-account JWT assertion — no extra deps).

Fully functional with just the service-account key.

## Apple Wallet

Needs the Pass Type ID + certificates, plus a **model** (a `.pass` folder with
`icon.png`, `logo.png`, and a base `pass.json` describing a `storeCard`):

```
APPLE_TEAM_ID=
APPLE_PASS_TYPE_IDENTIFIER=
APPLE_PASS_CERT_PATH=      # signer cert (PEM)
APPLE_PASS_KEY_PATH=       # signer key (PEM)
APPLE_PASS_CERT_PASSWORD=  # key passphrase, if any
APPLE_WWDR_CERT_PATH=      # Apple WWDR cert (PEM)
APPLE_PASS_MODEL_PATH=     # path to the .pass model folder
```

- `generateApplePkpass()` — builds a signed `.pkpass` (via `passkit-generator`,
  imported dynamically). Served by `GET /api/wallet/apple/passes/:serial`.

## Deferred (need live certs + devices to complete)

- Apple pass web service: register / list serials / latest pass / **unregister →
  void** endpoints, and **APNs push** on pass update.
- Campaign delivery (wallet card update + APNs / Google message).
