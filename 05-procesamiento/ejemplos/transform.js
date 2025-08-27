// transform.js (módulo puro, fácil de testear)
export function toProductList(root) {
  const productos = Array.isArray(root.producto) ? root.producto : [root.producto];
  return productos.map(p => ({
    id: p.$.id,
    category: p.$.categoria,
    name: p.nombre,
    price: Number(p.precio._ ?? p.precio),
    currency: p.precio.$?.moneda ?? "USD",
    stock: Number(p.stock),
    description: p.descripcion ?? null
  }));
}
