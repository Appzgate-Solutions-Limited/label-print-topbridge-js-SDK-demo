# TOPSALE Label Printing

[![npm](https://img.shields.io/npm/v/@appzgatenz/label-print-topbridge-js)](https://www.npmjs.com/package/@appzgatenz/label-print-topbridge-js) [![docs](https://img.shields.io/badge/docs-label--printing.topsale.biz-blue)](https://label-printing.topsale.biz/)

**Cloud-based label printing for any printer, anywhere.**

TOPSALE is a cloud-based label printing platform that lets you design, manage, and print labels from your browser. Connect any TSPL or ZPL printer via the lightweight TopBridge desktop app — no server setup, no middleware.

### Key Features

- 🎨 **Cloud Label Editor** — Design labels and create barcodes directly from your browser with a WYSIWYG editor
- 📊 **Excel Batch Printing** — Import spreadsheets and print labels in bulk with custom field mapping
- 🖨️ **Any TSPL/ZPL Printer** — TopBridge desktop app connects your printers to the cloud
- 🔌 **Odoo Integration** — Print labels seamlessly from within Odoo ERP, no tab switching
- 📦 **Multi-Framework SDK** — JavaScript Core (available now), Next.js and React (coming soon)

---

## Quick Links

| Platform | Description |
|----------|-------------|
| 🌐 [Official Website](https://topsale.biz/solution/label-printing/) | Product overview, features, and pricing |
| 🛠️ [TOPSALE Self-Service](https://service.topsale.co.nz/self-service) | Label Designer, Excel Print, Download Centre, and more |
| 🛍️ [TOPSALE App Store](https://service.topsale.co.nz/store) | Print service packages — subscription & pay-as-you-go |
| 📖 [Documentation](https://label-printing.topsale.biz/) | SDK guides, API reference, and interactive examples |
| ⬇️ [Download TopBridge](https://service.topsale.co.nz/self-service/download/topbridge) | Desktop app — connects your TSPL/ZPL printers to the cloud |

---

## Get Started

### For Business Users — TOPSALE Self-Service

No code required. Design and print labels directly from your browser:

1. **Sign up** at the [TOPSALE Self-Service](https://service.topsale.co.nz/self-service)
2. **Design labels** — Use the WYSIWYG Label Designer with TSPL/ZPL support, barcodes, and dynamic data
3. **Print** — [Download TopBridge](https://service.topsale.co.nz/self-service/download/topbridge) to connect your printer, or use Excel batch printing for bulk jobs

Flexible pricing with no hidden fees. [View plans →](https://service.topsale.co.nz/store)

### For Developers — SDK Integration

Install the JavaScript Core SDK:

```bash
npm install @appzgatenz/label-print-topbridge-js
```

```ts
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

// Ensure TopBridge App is running and run preflight checks
const preflight = await client.launch.ensureRunning(
  () => client.preflight.run()
)

// Print a label
await client.print.execute({
  template: 'PRICE_LABEL',
  printer: preflight.printers.data.defaultPrinter,
  products: [
    { name: 'Example', price: { value: 9.99, currency: '$', unit: '/ea' }, copies: 1 },
  ],
})
```

See the [full documentation](https://label-printing.topsale.biz/) for API reference, integration tutorials, and interactive examples.

---

## Development

This repository hosts the documentation and interactive demo site. To run it locally:

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) 10.33.4 (see `packageManager` in `package.json`)

### Setup

```bash
# Install dependencies
pnpm install
```

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start local dev server (`http://localhost:5173`) |
| `pnpm build` | Build for production (outputs to `.vitepress/dist`) |
| `pnpm preview` | Preview the production build locally |
| `pnpm deploy` | Deploy to Cloudflare Pages |
| `pnpm deploy:dry` | Run deploy pre-checks without uploading |
| `pnpm format` | Format code with Biome |
| `pnpm lint` | Lint code with Biome |
| `pnpm check` | Run Biome format + lint checks |

---

## Resources

- [SDK Source Code](https://github.com/topsale/label-print-topbridge-js) — GitHub repository
- [NPM Package](https://www.npmjs.com/package/@appzgatenz/label-print-topbridge-js) — `@appzgatenz/label-print-topbridge-js`

## License

Private — All rights reserved.
