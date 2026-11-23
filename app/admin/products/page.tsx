import { products } from '@/lib/data';
import priceOverrides from '@/data/price-overrides.json';
import imageOverrides from '@/data/image-overrides.json';
import ProductsEditor from './ProductsEditor';

export const dynamic = 'force-dynamic';

type PriceOv = number | { price?: number | null; compareAtPrice?: number | null };
type ImageOv = string | { image?: string | null; images?: Record<string, string> };

export default function AdminProductsPage() {
  const rows = products.map(p => {
    const po = (priceOverrides as Record<string, PriceOv>)[p.slug];
    const io = (imageOverrides as Record<string, ImageOv>)[p.slug];
    const priceOv = typeof po === 'number' ? po : po?.price ?? null;
    const capOv = typeof po === 'object' ? (po?.compareAtPrice ?? null) : null;
    const mainImgOv = typeof io === 'string' ? io : io?.image ?? null;
    const galleryOv = typeof io === 'object' ? (io?.images ?? {}) : {};
    return {
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAt: (p as any).compareAtPrice ?? null,
      priceOverride: priceOv,
      capOverride: capOv,
      image: p.image,
      mainImgOverride: mainImgOv,
      gallery: Array.isArray((p as any).images) ? (p as any).images : [],
      galleryOverrides: galleryOv,
    };
  });
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 6px' }}>📦 商品管理</h1>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 16px' }}>
        💰 改价/划线价 ｜ 🖼️ 主图 + 画廊逐张换（共{'{'}n{'}'} 张见卡片）｜ 保存后约 2 分钟全站生效
      </p>
      <ProductsEditor rows={rows} />
    </div>
  );
}
