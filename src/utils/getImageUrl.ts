import { API_URL } from '../api'

/**
 * Resolves the correct image URL for a product, handling:
 * - Missing / null URLs → placeholder
 * - Absolute http(s) URLs → passthrough
 * - Base64 data URLs → passthrough
 * - Relative /images/ paths → passthrough (served from public/)
 * - Relative upload paths → prepend API_URL
 */
export function getImageUrl(product: { image_url?: string } | null | undefined): string {
    if (!product?.image_url) return '/placeholder.jpg'
    const url = product.image_url
    if (url.startsWith('http')) return url
    if (url.startsWith('data:')) return url
    if (url.startsWith('/images/')) return url
    const cleanPath = url.replace(/^\/+/, '')
    return `${API_URL}/${cleanPath}`
}
