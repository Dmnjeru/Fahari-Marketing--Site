
# Patch: Load products from src/data/products.json (replace static PRODUCTS array)

## Goal
Replace the large, hard-coded `const PRODUCTS: Product[] = [...]` array in:
`src/app/products/page.tsx`

with an import from the JSON seed file we added:
`src/data/products.json`.

This keeps contenteditable data separate and makes it easy to replace with a CMS later.

---

## Steps (manual patch)

1. Open `src/app/products/page.tsx`.
2. Near the top of the file, add this import (after other imports):

```ts
// Replace existing static PRODUCTS array with this import
import PRODUCTS_JSON from "@/data/products.json";
```

3. Find the `const PRODUCTS: Product[] = [` declaration and delete the entire block (from `const PRODUCTS` up to the closing `];`).

4. After removing the block, add:

```ts
// Use the imported JSON as the products array
const PRODUCTS: Product[] = PRODUCTS_JSON as unknown as Product[];
```

This keeps TypeScript happy while using the JSON data.

---

## Quick automated `sed`-style command (use carefully)
Run this from the project root (make a git commit first):

```bash
# backup the file first
cp src/app/products/page.tsx src/app/products/page.tsx.bak

# Insert import line at top (after other imports)
awk 'NR==1{print "import PRODUCTS_JSON from \"@/data/products.json\";";} {print}' src/app/products/page.tsx.bak > src/app/products/page.tsx.tmp

# Manually edit src/app/products/page.tsx.tmp to remove the `const PRODUCTS: Product[] = [ ... ];` block,
# because automated removal in awk/sed is fragile for complex JS/TS literals.
```

**Recommendation:** Open the file in VS Code (or any editor) and perform the deletion + small additions manually using the snippet above. After making changes, run `npm run dev` to verify.

---

## If you prefer a CMS (Sanity)
- Create a Sanity project and schemas matching `products.json` shape.
- Replace `import PRODUCTS_JSON ...` with a server-side fetch:

```ts
// server component example (using Sanity's JS client)
import { createClient } from "next-sanity";
const client = createClient({ projectId: process.env.SANITY_PROJECT_ID, dataset: process.env.SANITY_DATASET, useCdn: false });
export default async function ProductsPage() {
  const PRODUCTS = await client.fetch('*[_type == "product"]{..., "imageUrl": image.asset->url }');
  ...
}
```

