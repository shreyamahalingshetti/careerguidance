import Image, { type StaticImageData } from 'next/image'

import alvasPu from '@/app/public/south/science/alvas_pu.jpg'
import christPu from '@/app/public/south/science/christ_pu.jpg'
import deekshaPu from '@/app/public/south/science/deeksha_pu.jpg'
import jainPu from '@/app/public/south/science/jain_pu.jpg'
import mesPuScience from '@/app/public/south/science/mes_pu_fixed.jpg'
import mountCarmelScience from '@/app/public/south/science/mount_carmel.jpg'
import nationalPuScience from '@/app/public/south/science/national_pu.jpg'
import stAloysiusScience from '@/app/public/south/science/st_aloysius.jpg'
import stJosephsScience from '@/app/public/south/science/st_josephs.jpg'

import bishopPuCommerce from '@/app/public/south/commerce/bishop_pu.jpg'
import jyotiPuCommerce from '@/app/public/south/commerce/jyoti_pu_pu.jpg'
import mesPuCommerce from '@/app/public/south/commerce/mes_pu_fixed.jpg'
import mountCarmelCommerce from '@/app/public/south/commerce/mount_carmel.jpg'
import nationalPuCommerce from '@/app/public/south/commerce/national_pu.jpg'
import shriBhagawaanCommerce from '@/app/public/south/commerce/shri_bhagawaan_pu.jpg'
import stJosephsCommerce from '@/app/public/south/commerce/st_josephs_pu.jpg'

import bishopPuArts from '@/app/public/south/arts/bishop_pu.jpg'
import jyotiPuArts from '@/app/public/south/arts/jyoti_pu_pu.jpg'
import mountCarmelArts from '@/app/public/south/arts/mount_carmel_pu.jpg'
import nationalPuArts from '@/app/public/south/arts/national_pu.jpg'
import stAloysiusArts from '@/app/public/south/arts/st_aloysius.jpg'
import stJosephsArts from '@/app/public/south/arts/st_josephs_pu.jpg'

import chetanPuNorthScience from '@/app/public/north/science/chetan_pu.jpg'
import empowerPuNorthScience from '@/app/public/north/science/empower_pu.jpg'
import hanchinmaniPuNorthScience from '@/app/public/north/science/Hanchinmani PU College Dharwad.jpg'
import jnanaamruthaPuNorthScience from '@/app/public/north/science/jnanaamrutha_pu.jpg'
import preranaPuNorthScience from '@/app/public/north/science/prerana_pu.jpg'
import prismPuNorthScience from '@/app/public/north/science/prism_pu.jpg'
import spandanaPuNorthScience from '@/app/public/north/science/spandana_pu.jpg'
import vidyaniketanPuNorthScience from '@/app/public/north/science/vidyaniketan.jpg'
import vivekanandaPuNorthScience from '@/app/public/north/science/vivekananda_pu.jpg'

import appaPuNorthCommerce from '@/app/public/north/commerce/appa_pu.jpg'
import bagewadiPuNorthCommerce from '@/app/public/north/commerce/bagewadi_pu.jpg'
import basaveshwarPuNorthCommerce from '@/app/public/north/commerce/basaveshwar_pu.jpg'
import cVRamanPuNorthCommerce from '@/app/public/north/commerce/c_v_raman_pu.jpg'
import hanchinmaniPuNorthCommerce from '@/app/public/north/commerce/Hanchinmani PU College Dharwad.jpg'
import kacdPuNorthCommerce from '@/app/public/north/commerce/kacd_pu.jpg'
import sbPuNorthCommerce from '@/app/public/north/commerce/sb_pu.jpg'
import shaheenPuNorthCommerce from '@/app/public/north/commerce/shaheen_pu.jpg'
import shriSaiPuNorthCommerce from '@/app/public/north/commerce/shri_sai_pu.png'

import basaveshwarPuNorthArts from '@/app/public/north/arts/basaveshwar_pu.jpg'
import jssPuNorthArts from '@/app/public/north/arts/jss_pu.jpg'
import kacdPuNorthArts from '@/app/public/north/arts/kacd_pu.jpg'
import karnatakaArtsPuNorthArts from '@/app/public/north/arts/karnataka_arts_pu.jpg'
import kittelPuNorthArts from '@/app/public/north/arts/kittel_pu.jpg'
import mgvcPuNorthArts from '@/app/public/north/arts/mgvc_pu.jpg'
import mmkPuNorthArts from '@/app/public/north/arts/mmk_pu.jpg'
import nehruPuNorthArts from '@/app/public/north/arts/nehru_pu.jpg'
import svmPuNorthArts from '@/app/public/north/arts/svm_pu.jpg'

type SupportedStream = 'science' | 'commerce' | 'arts'

type SupportedRegion = 'north' | 'south'

type ImageItem = {
  src: StaticImageData
  title: string
  href?: string
}

function normalizeHref(href?: string) {
  if (!href) return undefined
  const trimmed = href.trim()
  if (!trimmed) return undefined

  // Clean up common copy/paste artifacts.
  const cleaned = trimmed.replace(/[\])}]+$/g, '')

  if (/^https?:\/\//i.test(cleaned)) return cleaned
  if (/^\/\//.test(cleaned)) return `https:${cleaned}`
  return `https://${cleaned}`
}

const SOUTH_IMAGES: Record<SupportedStream, ImageItem[]> = {
  science: [
    { src: alvasPu, title: "Alva's PU College (Moodbidri / Dakshina Kannada)", href: 'https://alvaspucollege.org/' },
    { src: christPu, title: 'Christ Junior College (Bengaluru)', href: 'https://www.christjuniorcollege.in/' },
    { src: deekshaPu, title: 'Deeksha / RNS / integrated PU colleges (Bengaluru)', href: 'https://www.rnspuc.edu.in/' },
    { src: jainPu, title: 'Jain PU College (multiple centres, Bengaluru)', href: 'https://www.jaincollege.ac.in/' },
    { src: mesPuScience, title: 'MES / Sri Bhagawan Mahaveer Jain PU (Bengaluru)', href: 'https://mesacspuc.in/' },
    { src: mountCarmelScience, title: 'Mount Carmel PU College (Bengaluru)', href: 'https://www.mcpuc.edu.in/' },
    { src: nationalPuScience, title: 'National PU College (Jayanagar / Bengaluru)', href: 'https://www.nationalpujayanagar.edu.in/' },
    { src: stAloysiusScience, title: 'St. Aloysius PU College (Mangaluru)', href: 'https://www.staloysiuspuc.in/' },
    { src: stJosephsScience, title: "St. Joseph's Pre-University College (Bengaluru)", href: 'https://www.sjpuc.in/' },
  ],
  commerce: [
    { src: bishopPuCommerce, title: 'Bishop Cotton Women’s Christian PU (Bengaluru)', href: 'https://bcwclc.com/' },
    { src: jyotiPuCommerce, title: 'Jyoti Nivas PU College (Bengaluru)', href: 'https://jnpuc.org/' },
    { src: mesPuCommerce, title: 'MES PU College (Bengaluru)', href: 'https://mesacspuc.in/' },
    { src: mountCarmelCommerce, title: 'Mount Carmel PU College (Bengaluru)*', href: 'https://www.mcpuc.edu.in/' },
    { src: nationalPuCommerce, title: 'National PU College (Bengaluru)', href: 'https://www.nationalpujayanagar.edu.in/' },
    { src: shriBhagawaanCommerce, title: 'Sri Bhagawan Mahaveer Jain PU (Bengaluru)', href: 'https://www.jaincollege.ac.in/' },
    { src: stJosephsCommerce, title: 'St. Joseph’s PU College (Bengaluru)', href: 'https://www.sjpuc.in/' },
  ],
  arts: [
    { src: bishopPuArts, title: "Bishop Cotton Women's Christian PU (Bengaluru)", href: 'https://bcwclc.com/' },
    { src: jyotiPuArts, title: 'Jyoti Nivas PU College (Bengaluru)', href: 'https://jnpuc.org/' },
    { src: mountCarmelArts, title: 'Mount Carmel PU College (Bengaluru)', href: 'https://www.mcpuc.edu.in/' },
    { src: nationalPuArts, title: 'National PU / MES / Jain PU (humanities combinations) (Bengaluru)', href: 'https://www.nationalpujayanagar.edu.in/' },
    { src: stAloysiusArts, title: 'St. Aloysius PU College (Bengaluru)', href: 'https://www.staloysiuspuc.in/' },
    { src: stJosephsArts, title: "St. Joseph's PU College (Bengaluru)", href: 'https://www.sjpuc.in/' },
  ],
}

const NORTH_IMAGES: Record<SupportedStream, ImageItem[]> = {
  science: [
    { src: empowerPuNorthScience, title: 'Empower PU College Dharwad', href: 'https://www.empowerpucollege.com/' },
    {
      src: hanchinmaniPuNorthScience,
      title: 'Smt. Vidya P. Hanchinmani PU Science College Dharwad',
      href: 'https://www.hanchinmanicollege.com/',
    },
    { src: jnanaamruthaPuNorthScience, title: 'Jnanaamrutha PU College, Ballari', href: 'https://jnanaamrutha.in/' },
    {
      src: vidyaniketanPuNorthScience,
      title: 'Vidyaniketan PU Science College, Hubli',
      href: 'https://vidyaniketanpusciencecollegehubli.in/Default.aspx',
    },
    {
      src: vivekanandaPuNorthScience,
      title: 'Swami Vivekananda PU Science College, Dharwad',
      href: 'https://svvsbilagi.in/',
    },
    { src: preranaPuNorthScience, title: 'KLE Prerana PU College, BVB Campus, Hubballi' },
    { src: spandanaPuNorthScience, title: 'Spandana Pre University College, Ilkal' },
    { src: prismPuNorthScience, title: 'Prism PU Science College, Dharwad' },
    { src: chetanPuNorthScience, title: 'Chetan & Sachetan Pre-University Science Colleges, Hubballi' },
  ],
  commerce: [
    {
      src: hanchinmaniPuNorthCommerce,
      title: 'Smt. Vidya P. Hanchinmani PU College, Dharwad',
      href: 'https://www.hanchinmanicollege.com/',
    },
    { src: kacdPuNorthCommerce, title: 'Karnatak Arts & Commerce PU College', href: 'https://www.kacd.ac.in/' },
    {
      src: basaveshwarPuNorthCommerce,
      title: 'Basaveshwar Commerce PU College, Bagalkote',
      href: 'https://bvvsbccbbgk.org/',
    },
    {
      src: sbPuNorthCommerce,
      title: 'S.B. Arts & K.C.P. Science & Commerce PU College, Vijayapura (Bijapur)',
      href: 'https://sbkcppu.ac.in/',
    },
    {
      src: shaheenPuNorthCommerce,
      title: 'Shaheen PU College (Commerce), Bidar',
      href: 'https://shaheengroup.org/shaheen-pu-college-gulbarga/',
    },
    {
      src: shriSaiPuNorthCommerce,
      title: 'Shri Sai PU Science & Commerce College, Dharwad',
      href: 'https://shrisaicollegedharwad.com/',
    },
    {
      src: cVRamanPuNorthCommerce,
      title: 'C V Raman PU Science and Commerce College, Dharwad',
      href: 'https://www.cvramancollegedharwad.com/',
    },
    { src: bagewadiPuNorthCommerce, title: "KLE Society's G.I. Bagewadi PU College, Belagavi" },
    { src: appaPuNorthCommerce, title: 'Appa PU College (Commerce), Kalaburagi' },
  ],
  arts: [
    { src: basaveshwarPuNorthArts, title: 'Basaveshwar PU College', href: 'https://bvvsbacb.org/' },
    { src: kacdPuNorthArts, title: 'Karnatak Arts & Commerce PU College', href: 'https://www.kacd.ac.in/' },
    { src: karnatakaArtsPuNorthArts, title: 'Karnataka Arts PU College', href: 'https://www.kascc.in.net/' },
    { src: kittelPuNorthArts, title: 'Kittel PU College', href: 'https://www.kittelartscollege.ac.in/' },
    { src: mgvcPuNorthArts, title: 'MGVC PU College', href: 'https://www.mgvcmbl.in/' },
    { src: nehruPuNorthArts, title: 'Nehru PU College', href: 'https://nehrucollegehubli.edu.in/' },
    { src: svmPuNorthArts, title: 'SVM PU College', href: 'https://svmdegreecollege.edu.in/' },
    { src: jssPuNorthArts, title: 'JSS PU College' },
    { src: mmkPuNorthArts, title: 'MMK PU College' },
  ],
}

const REGION_IMAGES: Record<SupportedRegion, Record<SupportedStream, ImageItem[]>> = {
  south: SOUTH_IMAGES,
  north: NORTH_IMAGES,
}

export function CollegeImages({
  stream,
  region,
}: {
  stream: string
  region: string
}) {
  const regionKey = region as SupportedRegion
  if (regionKey !== 'south' && regionKey !== 'north') return null

  const items = REGION_IMAGES[regionKey]?.[stream as SupportedStream] ?? []
  if (items.length === 0) return null

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          (() => {
            const href = normalizeHref(item.href)

            const CardInner = (
              <>
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    priority={idx < 3}
                  />
                </div>
                <div className="p-3 text-sm font-medium text-gray-900 dark:text-white group-hover:underline">
                  {item.title}
                </div>
              </>
            )

            return href ? (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-lg border bg-white dark:bg-gray-900"
              >
                {CardInner}
              </a>
            ) : (
              <div key={idx} className="overflow-hidden rounded-lg border bg-white dark:bg-gray-900">
                {CardInner}
              </div>
            )
          })()
        ))}
      </div>
    </div>
  )
}
