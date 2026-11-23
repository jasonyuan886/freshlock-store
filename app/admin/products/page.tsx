import { products } from '@/lib/data';
import priceOverrides from '@/data/price-overrides.json';
import imageOverrides from '@/data/image-overrides.json';
import ProductsEditor from './ProductsEditor';

export const dynamic = 'force-dynamic';

export default function AdminProductsPage() {
  const rows = products.map(p => ({
    slug: p.slug,
    name: p.name,
    basePrice: (p as any).__basePrice ?? null,
    price: p.price,
    hasOverride: (priceOverrides as Record<string, number>)[p.slug] != null,
    image: p.image,
    imageOverride: (imageOverrides as Record<string, string>)[p.slug] || null,
  }));
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 6px' }}>📦 商品管理</h1>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 16px' }}>
        💰 改价后自动提交代码，约 2 分钟全站生效 ｜ 🖼️ 换图支持 PNG/JPG/WebP（≤3MB），同样在数分钟内生效
      </p>
      <ProductsEditor rows={rows} />
    </div>
  );
}
