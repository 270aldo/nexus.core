# Dependency Migration Report

## Summary
- Total dependencies: 287
- Used dependencies: 74
- Unused dependencies: 213

## Unused Dependencies (Safe to Remove)

- @11labs/react
- @ag-grid-enterprise/all-modules
- @algolia/autocomplete-js
- @amcharts/amcharts5
- @apollo/client
- @auth0/auth0-react
- @aws-sdk/client-cognito-identity-provider
- @aws-sdk/credential-providers
- @blocknote/core
- @blocknote/mantine
- @blocknote/react
- @builder.io/dev-tools
- @builder.io/react
- @bwip-js/browser
- @chakra-ui/icons
- @chakra-ui/react
- @chakra-ui/system
- @ckeditor/ckeditor5-build-classic
- @ckeditor/ckeditor5-react
- @clerk/clerk-react
- @emotion/react
- @emotion/styled
- @fontsource/roboto
- @grapesjs/react
- @headlessui/react
- @hello-pangea/dnd
- @heygen/streaming-avatar
- @intercom/messenger-js-sdk
- @lexical/react
- @liveblocks/client
- @liveblocks/react
- @liveblocks/zustand
- @mapbox/mapbox-gl-draw
- @monaco-editor/react
- @mui/icons-material
- @mui/material
- @mysten/sui
- @newrelic/browser-agent
- @novnc/novnc
- @openai/realtime-api-beta
- @pdfme/common
- @pdfme/generator
- @pdfme/schemas
- @pdfme/ui
- @play-ai/agent-web-sdk
- @react-google-maps/api
- @react-three/drei
- @react-three/fiber
- @remotion/player
- @reown/appkit
- @reown/appkit-adapter-solana
- @reown/appkit-adapter-wagmi
- @sanity/client
- @solana/spl-token
- @solana/wallet-adapter-react
- @solana/wallet-adapter-wallets
- @solana/web3.js
- @stackframe/react
- @stripe/firestore-stripe-payments
- @stripe/react-stripe-js
- @stripe/stripe-js
- @suiet/wallet-kit
- @supabase/auth-ui-react
- @supabase/auth-ui-shared
- @tailwindcss/typography
- @talkjs/react
- @tanstack/react-query
- @tanstack/react-table
- @tiptap/extension-bullet-list
- @tiptap/extension-code-block
- @tiptap/extension-code-block-lowlight
- @tiptap/extension-collaboration
- @tiptap/extension-collaboration-cursor
- @tiptap/extension-document
- @tiptap/extension-dropcursor
- @tiptap/extension-focus
- @tiptap/extension-font-family
- @tiptap/extension-heading
- @tiptap/extension-horizontal-rule
- @tiptap/extension-ordered-list
- @tiptap/extension-paragraph
- @tiptap/extension-placeholder
- @tiptap/extension-subscript
- @tiptap/extension-superscript
- @tiptap/extension-table
- @tiptap/extension-table-cell
- @tiptap/extension-table-header
- @tiptap/extension-table-row
- @tiptap/extension-task-item
- @tiptap/extension-task-list
- @tiptap/extension-text-style
- @tiptap/extension-typography
- @tiptap/pm
- @tomtom-international/web-sdk-maps
- @tomtom-international/web-sdk-services
- @turf/turf
- @twilio/voice-sdk
- @uidotdev/usehooks
- @vapi-ai/web
- @wavesurfer/react
- @xyflow/react
- @xzdarcy/react-timeline-editor
- ag-grid-react
- agora-rtc-react
- agora-rtc-sdk-ng
- algoliasearch
- amazon-cognito-identity-js
- amplitude-js
- audio-decode
- aws-sdk
- blockly
- bpmn-js
- chart.js
- ckeditor5
- ckeditor5-premium-features
- convex
- daisyui
- docx
- embla-carousel-react
- epubjs
- fabric
- file-type
- firebase
- framer-motion
- grapejs
- grapesjs
- grapesjs-react
- html2canvas
- i18next
- i18next-browser-languagedetector
- i18next-http-backend
- i18next-parser
- i18next-scanner
- idb
- immer
- konva
- leaflet
- lexical
- lightweight-charts
- livekit-client
- lodash
- mammoth
- mapbox-gl
- mathjs
- mermaid
- mixpanel-browser
- openai-partial-stream
- pdfjs-dist
- plotly.js
- qrcode.react
- react-alice-carousel
- react-big-calendar
- react-big-schedule
- react-circular-progressbar
- react-colorful
- react-confetti
- react-cookie-consent
- react-datasheet-grid
- react-diff-viewer
- react-dropzone
- react-easy-crop
- react-email-editor
- react-firebase-hooks
- react-firebaseui
- react-grid-layout
- react-i18next
- react-intersection-observer
- react-konva
- react-leaflet
- react-loading-skeleton
- react-lottie-player
- react-map-gl
- react-mentions
- react-onesignal
- react-plaid-link
- react-plotly.js
- react-pro-sidebar
- react-quill
- react-reader
- react-remark
- react-rnd
- react-slick
- react-social-media-embed
- react-table
- react-to-pdf
- react-to-print
- react-use-websocket
- react-virtualized-auto-sizer
- react-webcam
- react-wheel-of-prizes
- react-window
- react-zxing
- recordrtc
- remark-gfm
- remotion
- shepherd.js
- stream-chat
- stream-chat-react
- sudoku-gen
- tailwindcss-animate
- talkjs
- tesseract.js
- three
- tone
- trading-vue-js
- ts-morph
- userflow.js
- viem
- vinyl-fs
- vite-plugin-html-inject
- wagmi
- wavesurfer.js
- web-vitals

## Import Mappings Required

The following imports need to be updated:

- `@chakra-ui/*` → `@/components/ui/*`
- `@mui/material*` → `@/components/ui/*`
- `daisyui*` → `@/components/ui/*`
- `@headlessui/react*` → `@radix-ui/react-*`
- `react-icons*` → `lucide-react*`
- `@chakra-ui/icons*` → `lucide-react*`
- `@mui/icons-material*` → `lucide-react*`
- `react-quill*` → `@tiptap/react*`
- `@ckeditor/*` → `@tiptap/*`
- `@lexical/react*` → `@tiptap/react*`
- `@blocknote/*` → `@tiptap/*`
- `ag-grid-react*` → `@tanstack/react-table*`
- `react-table*` → `@tanstack/react-table*`
- `react-datasheet-grid*` → `@tanstack/react-table*`
- `react-beautiful-dnd*` → `@dnd-kit/sortable*`
- `@hello-pangea/dnd*` → `@dnd-kit/sortable*`
- `chart.js*` → `recharts*`
- `@amcharts/amcharts5*` → `recharts*`
- `plotly.js*` → `recharts*`
- `react-plotly.js*` → `recharts*`
- `lightweight-charts*` → `recharts*`
- `trading-vue-js*` → `recharts*`
- `jspdf*` → `@react-pdf/renderer*`
- `html2pdf.js*` → `@react-pdf/renderer*`
- `@pdfme/*` → `@react-pdf/renderer*`

## Migration Steps

1. **Backup current state**
   ```bash
   cp package.json package.json.backup
   cp -r node_modules node_modules.backup
   ```

2. **Update package.json**
   ```bash
   cp package-clean.json package.json
   ```

3. **Clean install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Update imports** (use provided script or manually)

5. **Test thoroughly**
   ```bash
   npm run type-check
   npm run lint
   npm run dev
   ```
