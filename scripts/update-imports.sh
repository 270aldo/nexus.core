#!/bin/bash

# Auto-generated import update script
# Review changes carefully before committing!

echo 'Updating imports...'

# Update @chakra-ui/ to @/components/ui/
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@chakra-ui\//@\/components\/ui\//g' {} +
# Update @mui/material to @/components/ui/
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@mui\/material/@\/components\/ui\//g' {} +
# Update daisyui to @/components/ui/
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/daisyui/@\/components\/ui\//g' {} +
# Update @headlessui/react to @radix-ui/react-
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@headlessui\/react/@radix-ui\/react-/g' {} +
# Update react-icons to lucide-react
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/react-icons/lucide-react/g' {} +
# Update @chakra-ui/icons to lucide-react
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@chakra-ui\/icons/lucide-react/g' {} +
# Update @mui/icons-material to lucide-react
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@mui\/icons-material/lucide-react/g' {} +
# Update react-quill to @tiptap/react
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/react-quill/@tiptap\/react/g' {} +
# Update @ckeditor/ to @tiptap/
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@ckeditor\//@tiptap\//g' {} +
# Update @lexical/react to @tiptap/react
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@lexical\/react/@tiptap\/react/g' {} +
# Update @blocknote/ to @tiptap/
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@blocknote\//@tiptap\//g' {} +
# Update ag-grid-react to @tanstack/react-table
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/ag-grid-react/@tanstack\/react-table/g' {} +
# Update react-table to @tanstack/react-table
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/react-table/@tanstack\/react-table/g' {} +
# Update react-datasheet-grid to @tanstack/react-table
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/react-datasheet-grid/@tanstack\/react-table/g' {} +
# Update react-beautiful-dnd to @dnd-kit/sortable
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/react-beautiful-dnd/@dnd-kit\/sortable/g' {} +
# Update @hello-pangea/dnd to @dnd-kit/sortable
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@hello-pangea\/dnd/@dnd-kit\/sortable/g' {} +
# Update chart.js to recharts
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/chart.js/recharts/g' {} +
# Update @amcharts/amcharts5 to recharts
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@amcharts\/amcharts5/recharts/g' {} +
# Update plotly.js to recharts
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/plotly.js/recharts/g' {} +
# Update react-plotly.js to recharts
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/react-plotly.js/recharts/g' {} +
# Update lightweight-charts to recharts
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/lightweight-charts/recharts/g' {} +
# Update trading-vue-js to recharts
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/trading-vue-js/recharts/g' {} +
# Update jspdf to @react-pdf/renderer
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/jspdf/@react-pdf\/renderer/g' {} +
# Update html2pdf.js to @react-pdf/renderer
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/html2pdf.js/@react-pdf\/renderer/g' {} +
# Update @pdfme/ to @react-pdf/renderer
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec sed -i '' 's/@pdfme\//@react-pdf\/renderer/g' {} +

echo 'Import updates complete!'
echo 'Please review all changes before committing.'
