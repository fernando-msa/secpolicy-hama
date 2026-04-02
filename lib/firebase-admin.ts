/**
 * Exemplo para uso no backend (Node.js) com Firebase Admin SDK.
 *
 * Para ativar de fato:
 * 1) Instale `firebase-admin` no ambiente de deploy.
 * 2) Troque `serviceAccount` por credenciais válidas (JSON).
 * 3) Use somente em rotas/server actions, nunca no cliente.
 *
 * Referência baseada no snippet solicitado em revisão:
 *
 * const admin = require('firebase-admin')
 * const serviceAccount = require('path/to/serviceAccountKey.json')
 * admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
 */

export const firebaseAdminExample = 'firebase-admin initialization template'
