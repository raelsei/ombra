/* ===================================================================
   OMBRA · content & copy. Single source of truth for every section.
   Kept verbatim from the design spec (README §6).
   =================================================================== */

export interface CollectionItem {
  id: string
  index: string
  name: string
  material: string
  /** reveal stagger delay (s) */
  delay: number
  /** generation-prompt summary → alt text */
  alt: string
  /** 12-col editorial placement */
  gridColumn: string
  /** vertical offset for the staggered baseline */
  margin: string
}

export interface LookItem {
  id: string
  caption: string
  ratio: string
  /** 12-col grid placement */
  gridColumn: string
  /** vertical offset for the asymmetric editorial layout */
  margin: string
  delay: number
  alt: string
}

export const COLLECTION: CollectionItem[] = [
  { id: 'rom-piece-1', index: '01', name: 'Shroud Coat', material: 'Wool · Silence', delay: 0, alt: 'A floor-length draped wool coat swallowing the body, hood up, figure half-turned into shadow.', gridColumn: '1 / span 7', margin: '0' },
  { id: 'rom-piece-2', index: '02', name: 'Second Skin', material: 'Bonded Jersey', delay: 0.08, alt: 'A bonded-jersey dress moulded to the torso, arms wrapped across the chest.', gridColumn: '9 / span 4', margin: 'clamp(90px,15vh,200px) 0 0' },
  { id: 'rom-piece-3', index: '03', name: 'Void Trouser', material: 'Raw Silk', delay: 0.05, alt: 'Wide raw-silk trousers, bare torso cropped at the ribs, fabric catching a single light.', gridColumn: '2 / span 4', margin: 'clamp(40px,8vh,110px) 0 0' },
  { id: 'rom-piece-4', index: '04', name: 'Relic Knit', material: 'Hand Loom', delay: 0.12, alt: 'An oversized hand-loomed knit unravelling at the hem, figure receding into black.', gridColumn: '7 / span 5', margin: 'clamp(120px,18vh,240px) 0 0' },
  { id: 'rom-piece-5', index: '05', name: 'Membrane Shirt', material: 'Organza', delay: 0.06, alt: 'A translucent organza shirt, light passing through, shoulder and collarbone beneath.', gridColumn: '1 / span 5', margin: 'clamp(40px,8vh,110px) 0 0' },
  { id: 'rom-piece-6', index: '06', name: 'Absence Gown', material: 'Cupro · Air', delay: 0.13, alt: 'A long cupro gown caught mid-movement, hem lifting, the body barely there.', gridColumn: '8 / span 4', margin: 'clamp(100px,16vh,210px) 0 0' },
]

export const LOOKS: LookItem[] = [
  { id: 'rom-look-1', caption: 'Look 01 · Figure, dissolving', ratio: '3 / 4', gridColumn: '1 / span 6', margin: '0', delay: 0, alt: 'Full-length figure walking out of frame, strong motion blur, dissolving into the black.' },
  { id: 'rom-look-2', caption: 'Look 02 · The coat, worn by air', ratio: '4 / 5', gridColumn: '8 / span 5', margin: 'clamp(60px,12vh,150px) 0 0', delay: 0.1, alt: 'A coat billowing as if worn by no one, empty hood, wind-caught fabric.' },
  { id: 'rom-look-3', caption: 'Look 03 · Detail, the seam of absence', ratio: '1 / 1', gridColumn: '2 / span 4', margin: 'clamp(20px,6vh,80px) 0 0', delay: 0.06, alt: 'Extreme close-up of a raw seam / hand-stitch on pale fabric, shallow depth of field.' },
  { id: 'rom-look-4', caption: 'Look 04 · Exit', ratio: '3 / 4', gridColumn: '8 / span 4', margin: 'clamp(10px,3vh,40px) 0 0', delay: 0.13, alt: 'The figure from behind at the edge of the frame, mostly shadow, one shoulder lit.' },
]

export const HOUSE_SPECS: { term: string; value: string; href?: string }[] = [
  { term: 'Atelier', value: 'Antwerp & Paris' },
  { term: 'Material', value: 'Wool, silk, organza, air' },
  { term: 'Release', value: 'Once yearly · edition of few' },
  { term: 'Contact', value: 'studio@ombra.atelier', href: 'mailto:studio@ombra.atelier' },
]

export const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Collection', href: '#collection' },
  { label: 'Lookbook', href: '#lookbook' },
  { label: 'House', href: '#house' },
]

export const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: 'Instagram', href: '#top' },
  { label: 'Contact', href: '#top' },
  { label: 'Stockists', href: '#top' },
  { label: 'Press', href: '#top' },
]

export const HOUSE_PORTRAIT_ALT =
  'A quiet studio portrait, figure lit from one side against pure black, face turned away, couture drape on the shoulders.'
