import type { SdkResponse, Transport, V2Action } from '@appzgatenz/label-print-topbridge-js'

export interface CapturedRequest {
  action: V2Action
  payload?: Record<string, unknown>
  requestId?: string
}

type OnRequestCallback = (request: CapturedRequest) => void

const MOCK_PRINTERS = {
  count: 1,
  defaultPrinter: 'Mock Printer',
  printers: [{ name: 'Mock Printer', isDefault: true, protocol: 'TSPL' as const }],
}

const MOCK_TEMPLATES = {
  count: 2,
  templates: [
    { id: '1', name: 'Price Label', code: 'PRICE_LABEL', isEnabled: true },
    { id: '2', name: 'Product Tag', code: 'PRODUCT_TAG', isEnabled: true },
  ],
}

const MOCK_TEMPLATE_SCHEMA = {
  templateId: '1',
  code: 'PRICE_LABEL',
  name: 'Price Label',
  fields: [
    { name: 'name', type: 'text' as const, required: true, default: 'Test Product' },
    { name: 'price', type: 'price' as const, required: true, default: '1.99' },
    { name: 'copies', type: 'integer' as const, required: false, default: '1' },
  ],
}

const MOCK_RESPONSES: Record<string, () => SdkResponse<any>> = {
  health: () => ({
    status: 'ok',
    type: 'pong',
    isRunning: true,
    data: { isLoggedIn: true, version: '0.0.0-dev', networkStatus: 'connected' },
    message: 'OK',
  }),
  benefits: () => ({
    status: 'ok',
    data: { isValid: true, hasPrintBenefit: true, remainingPrints: 999 },
    message: 'OK',
  }),
  printers: () => ({
    status: 'ok',
    data: MOCK_PRINTERS,
    message: 'OK',
  }),
  templates: () => ({
    status: 'ok',
    data: MOCK_TEMPLATES,
    message: 'OK',
  }),
  template: () => ({
    status: 'ok',
    data: MOCK_TEMPLATE_SCHEMA,
    message: 'OK',
  }),
  print: () => ({
    status: 'ok',
    data: {
      printedCopies: 1,
      jobId: 'dev-mock-001',
      templateName: 'Price Label',
      userId: 'dev-user',
    },
    message: 'OK',
    warnings: [
      {
        code: 'SIZE_MISMATCH',
        reason: 'size_mismatch',
        message: "Template size does not match the printer's loaded media size.",
      },
    ],
  }),
  version: () => ({
    status: 'ok',
    data: { version: '0.0.0-dev' },
    message: 'OK',
  }),
}

export class DevTransport implements Transport {
  private onRequest: OnRequestCallback

  constructor(onRequest: OnRequestCallback) {
    this.onRequest = onRequest
  }

  async send<T>(options: {
    action: V2Action
    payload?: Record<string, unknown>
    timeout: number
    requestId?: string
  }): Promise<SdkResponse<T>> {
    this.onRequest({
      action: options.action,
      payload: options.payload,
      requestId: options.requestId,
    })

    // ponytail: kick-session 按 payload 回传解除态；单独处理以免改全部 factory 签名。
    // 教学性简化——真实服务端维护阻断态，这里假设踢出后立即 withinLimit。
    if (options.action === 'kick-session') {
      const ids = (options.payload?.sessionIds as string[]) ?? []
      return {
        status: 'ok',
        data: {
          kickedSessionIds: ids,
          failedSessionIds: [],
          limit: 2,
          usedSessions: 1,
          withinLimit: true,
          sessions: [
            {
              id: 'sess-1',
              ipAddress: '192.168.1.10',
              started: '2026-07-30 09:00:00',
              lastAccess: '2026-07-31 08:00:00',
              clients: 'TopBridge_windows',
              isCurrent: true,
            },
          ],
        } as T,
        message: 'OK',
      }
    }

    const factory = MOCK_RESPONSES[options.action]
    if (factory) {
      return factory() as SdkResponse<T>
    }

    return { status: 'ok', data: {} as T, message: `Mock response for ${options.action}` }
  }
}
