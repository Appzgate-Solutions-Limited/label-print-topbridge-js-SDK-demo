export const codeTemplates: Record<string, string> = {
  basic: `import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

// Step 1: Preflight
const preflight = await client.launch.ensureRunning(
  () => client.preflight.run({
    onStepChange: (step) => console.log(\`Step: \${step}...\`)
  }),
  { onLaunching: () => console.log('Launching TopBridge...') }
)

console.log('✓ Preflight passed')
console.log(\`Printers: \${preflight.printers.data?.count}\`)

// Step 2: Print
const result = await client.print.execute({
  template: 'PRICE_LABEL',
  printer: preflight.printers.data?.defaultPrinter,
  products: [{
    name: 'Test Product',
    price: { value: 3.99, currency: '$', unit: '/kg' },
    copies: 1
  }]
})

console.log(\`✓ Print successful: \${result.data.printedCopies} copies\`)
console.log(\`  Template: \${result.data.templateName}\`)
`,

  'error-handling': `import {
  TopBridgeClient,
  TopBridgeError,
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgeConfigError,
  TopBridgeValidationError,
  TopBridgePrinterError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
} from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

// Preflight with full error handling
try {
  const preflight = await client.preflight.run({
    onStepChange: (step) => console.log(\`Step: \${step}...\`)
  })
  console.log('✓ Preflight passed')
  console.log(\`Printer: \${preflight.printers.data?.defaultPrinter}\`)
} catch (err) {
  if (err instanceof TopBridgeConnectionError) {
    console.error('Connection error:', err.message)
    console.log('Make sure TopBridge desktop app is running')
  } else if (err instanceof TopBridgeAuthError) {
    console.error('Auth error:', err.message)
    if (err.code === 'UPDATE_REQUIRED') {
      console.log('Please update TopBridge')
      if (err.storeUrl) console.log('Store URL:', err.storeUrl)
    } else {
      console.log('Please log in to TopBridge')
    }
  } else if (err instanceof TopBridgeQuotaError) {
    console.error('Quota error:', err.message)
    console.log('Insufficient print quota')
    if (err.reason) console.log('Reason:', err.reason)
  } else if (err instanceof TopBridgePrinterError) {
    console.error('Printer error:', err.message)
    console.log('Check if printer is online')
  } else if (err instanceof TopBridgeTemplateError) {
    console.error('Template error:', err.message)
  } else if (err instanceof TopBridgeNetworkError) {
    console.error('Network error:', err.message)
  } else if (err instanceof TopBridgeSourceError) {
    console.error('Source error:', err.message)
  } else if (err instanceof TopBridgeConfigError) {
    console.error('Config error:', err.message)
  } else if (err instanceof TopBridgePrintError) {
    console.error('Print error:', err.message)
    if (err.details) console.log('Details:', err.details)
  } else {
    console.error('Unexpected error:', err.message)
  }
}

// Validation error test
try {
  await client.print.execute({
    template: 'PRICE_LABEL',
    printer: 'Test',
    products: [],
  })
} catch (err) {
  if (err instanceof TopBridgeValidationError) {
    console.error('Validation failed:', err.message)
    if (err.field) console.log('Field:', err.field)
    console.log('Products cannot be empty')
  }
}

// Simulate all error types to demonstrate instanceof narrowing
function simulateAndHandle(errorType: string) {
  try {
    switch (errorType) {
      case 'connection':
        throw new TopBridgeConnectionError('TopBridge App is not running')
      case 'auth-not-authenticated':
        throw new TopBridgeAuthError('User is not logged in', { code: 'NOT_AUTHENTICATED' })
      case 'auth-update-required':
        throw new TopBridgeAuthError('TopBridge App version is too low', { code: 'UPDATE_REQUIRED', storeUrl: 'https://example.com/update' })
      case 'quota':
        throw new TopBridgeQuotaError('Print quota exhausted', { reason: 'Monthly limit reached' })
      case 'printer':
        throw new TopBridgePrinterError('Printer is offline')
      case 'template':
        throw new TopBridgeTemplateError('Template not found')
      case 'network':
        throw new TopBridgeNetworkError('Cloud network disconnected')
      case 'source':
        throw new TopBridgeSourceError('Origin verification failed')
      case 'config':
        throw new TopBridgeConfigError('Invalid configuration')
      case 'print':
        throw new TopBridgePrintError('Print job failed', { details: { jobId: '12345' } })
      case 'validation':
        throw new TopBridgeValidationError('Invalid input', 'products')
      default:
        throw new TopBridgeError('Unknown error')
    }
  } catch (err) {
    if (err instanceof TopBridgeConnectionError) {
      console.log('[Simulated] ConnectionError:', err.message)
    } else if (err instanceof TopBridgeAuthError) {
      console.log('[Simulated] AuthError:', err.message, '- code:', err.code)
      if (err.storeUrl) console.log('  storeUrl:', err.storeUrl)
      if (err.downloadUrl) console.log('  downloadUrl:', err.downloadUrl)
    } else if (err instanceof TopBridgeQuotaError) {
      console.log('[Simulated] QuotaError:', err.message)
      if (err.reason) console.log('  reason:', err.reason)
    } else if (err instanceof TopBridgePrinterError) {
      console.log('[Simulated] PrinterError:', err.message)
    } else if (err instanceof TopBridgeTemplateError) {
      console.log('[Simulated] TemplateError:', err.message)
    } else if (err instanceof TopBridgeNetworkError) {
      console.log('[Simulated] NetworkError:', err.message)
    } else if (err instanceof TopBridgeSourceError) {
      console.log('[Simulated] SourceError:', err.message)
    } else if (err instanceof TopBridgeConfigError) {
      console.log('[Simulated] ConfigError:', err.message)
    } else if (err instanceof TopBridgePrintError) {
      console.log('[Simulated] PrintError:', err.message)
      if (err.details) console.log('  details:', err.details)
    } else if (err instanceof TopBridgeValidationError) {
      console.log('[Simulated] ValidationError:', err.message)
      if (err.field) console.log('  field:', err.field)
    } else if (err instanceof TopBridgeError) {
      console.log('[Simulated] TopBridgeError:', err.message)
    }
  }
}

// Run simulations for all error types
simulateAndHandle('connection')
simulateAndHandle('auth-not-authenticated')
simulateAndHandle('auth-update-required')
simulateAndHandle('quota')
simulateAndHandle('printer')
simulateAndHandle('template')
simulateAndHandle('network')
simulateAndHandle('source')
simulateAndHandle('config')
simulateAndHandle('print')
simulateAndHandle('validation')
`,

  'template-schema': `import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

// Step 1: List templates
const result = await client.templates.list()
console.log(\`✓ Found \${result.data.count} templates\`)

for (const t of result.data.templates ?? []) {
  console.log(\`  \${t.name} (\${t.code || t.id}) — \${t.isEnabled ? 'enabled' : 'disabled'}\`)
}

// Step 2: Query schema for first template
const firstCode = result.data.templates?.[0]?.code || result.data.templates?.[0]?.id
if (firstCode) {
  console.log(\`\\nQuerying schema for: \${firstCode}\`)
  const schema = await client.templates.schema(firstCode)
  console.log(\`✓ Template: \${schema.data.name} (\${schema.data.code})\`)
  console.log(\`  Fields: \${schema.data.fields?.length ?? 0}\`)

  for (const f of schema.data.fields ?? []) {
    console.log(\`  - \${f.dataField}: \${f.fieldType}\${f.required ? ' (required)' : ''}\`)
  }
}
`,

  'multi-product': `import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

// Step 1: Preflight
const preflight = await client.preflight.run({
  onStepChange: (step) => console.log(\`Step: \${step}...\`)
})
console.log('✓ Preflight passed')

// Step 2: Batch print multiple products
const result = await client.print.execute({
  template: 'PRICE_LABEL',
  printer: preflight.printers.data?.defaultPrinter,
  products: [
    { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, copies: 2 },
    { name: 'Banana', price: { value: 1.99, currency: '$', unit: '/lb' }, copies: 1 },
    { name: 'Orange', price: { value: 4.50, currency: '$', unit: '/kg' }, copies: 3 },
  ]
})

console.log(\`✓ Batch print successful\`)
console.log(\`  Total copies: \${result.data.printedCopies}\`)
console.log(\`  Job ID: \${result.data.jobId}\`)

if (result.warnings?.length) {
  for (const w of result.warnings) {
    console.warn(\`[\${w.code}] \${w.message}\`)
  }
}
`,

  'preflight-only': `import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

// Full preflight
console.log('--- Running full preflight ---')
const result = await client.preflight.run({
  onStepChange: (step) => console.log(\`→ \${step}...\`)
})

console.log('✓ Preflight passed')

// Health
console.log('\\nHealth:')
console.log(\`  Running: \${result.health.isRunning ? '✓' : '✗'}\`)
console.log(\`  Logged in: \${result.health.data?.isLoggedIn ? '✓' : '✗'}\`)
if (result.health.data?.version) console.log(\`  Version: \${result.health.data.version}\`)

// Benefits
console.log('\\nBenefits:')
console.log(\`  Valid: \${result.benefits.data?.isValid ? '✓' : '✗'}\`)
console.log(\`  Remaining: \${result.benefits.data?.remainingPrints ?? 'N/A'}\`)
if (result.benefits.data?.expiresAt) console.log(\`  Expires: \${result.benefits.data.expiresAt}\`)

// Printers
console.log('\\nPrinters:')
console.log(\`  Count: \${result.printers.data?.count ?? 0}\`)
console.log(\`  Default: \${result.printers.data?.defaultPrinter ?? 'None'}\`)
for (const p of result.printers.data?.printers ?? []) {
  console.log(\`  - \${p.name}\${p.isDefault ? ' (default)' : ''} [\${p.protocol || '-'}]\`)
}

// Health check only
console.log('\\n--- Health check only ---')
const health = await client.health.check()
console.log(\`TopBridge App: \${health.isRunning ? 'running' : 'not running'}\`)
if (health.data?.isLoggedIn !== undefined) console.log(\`Logged in: \${health.data.isLoggedIn ? 'Yes' : 'No'}\`)
`,

  'advanced-form': `import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

// Step 1: Preflight
const preflight = await client.launch.ensureRunning(
  () => client.preflight.run({
    onStepChange: (step) => console.log(\`Step: \${step}...\`)
  }),
  { onLaunching: () => console.log('Launching TopBridge...') }
)
console.log('✓ Preflight passed')

// Step 2: List templates
const templates = await client.templates.list()
const firstCode = templates.data.templates?.[0]?.code || templates.data.templates?.[0]?.id
console.log(\`Template: \${firstCode}\`)

// Step 3: Fetch schema
const schema = await client.templates.schema(firstCode!)
console.log(\`Schema: \${schema.data.fields?.length} fields\`)
for (const f of schema.data.fields ?? []) {
  if (f.fieldType !== 'line') {
    console.log(\`  \${f.dataField}: \${f.fieldType}\${f.required ? ' *' : ''}\`)
  }
}

// Step 4: Print with dynamic form data
const result = await client.print.execute({
  template: firstCode,
  printer: preflight.printers.data?.defaultPrinter,
  products: [{
    name: 'Test Product',
    price: { value: 9.99, currency: '$', unit: '/ea' },
    copies: 1
  }]
})

console.log(\`✓ Print successful: \${result.data.printedCopies} copies\`)
`,
}
