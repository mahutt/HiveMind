import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

async function scrape(url: string) {
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    $('script').remove()
    $('style').remove()
    $('iframe').remove()
    $('noscript').remove()

    // title
    let title =
      $('title').text().trim() ||
      $('h1').first().text().trim() ||
      $("meta[property='og:title']").attr('content') ||
      ''

    title = title.replace(
      /AACSB Accredited|logo|^\s*-\s*|\s*-\s*$|^\s*\|\s*|\s*\|\s*$/gi,
      ''
    )

    title = title.replace(/ - Concordia University$/g, '')

    // console.log("title", title);

    $('button').remove()
    $(".btn, .button, [role='button']").remove()
    $("input[type='button'], input[type='submit']").remove()

    const mainContent = $('.main-content, main, #main, article, .content')
    let content = ''

    if (mainContent.length > 0) {
      // use main content if area available
      content = mainContent.text().replace(/\s+/g, ' ').trim()
    } else {
      // excluding header/footer sections
      $('header, footer, nav, aside').remove()
      content = $('body').text().replace(/\s+/g, ' ').trim()

      // return $("body").text().replace(/\s+/g, " ");
    }

    return { title, content }
  } catch (error) {
    console.error('Error scraping:', error)
    throw error
  }
}

interface ChunkContentOptions {
  content: string
  maxChunkSize?: number
}

function chunkContent({
  content,
  maxChunkSize = 1000,
}: ChunkContentOptions): string[] {
  const chunks: string[] = []

  let remainingContent: string = content

  while (remainingContent.length > 0) {
    if (remainingContent.length <= maxChunkSize) {
      chunks.push(remainingContent)
      break
    }

    // break at sentence endings
    let breakPoint: number = remainingContent.lastIndexOf('. ', maxChunkSize)
    if (breakPoint === -1 || breakPoint < maxChunkSize * 0.5) {
      breakPoint = remainingContent.lastIndexOf(' ', maxChunkSize)
    }

    if (breakPoint === -1) {
      breakPoint = maxChunkSize
    }

    chunks.push(remainingContent.substring(0, breakPoint + 1).trim())
    remainingContent = remainingContent.substring(breakPoint + 1)
  }

  return chunks.filter((chunk: string) => chunk.length > 0)
}

async function scrapeAndSaveToJson(urls: string[]) {
  const results = []

  for (const url of urls) {
    const { title, content } = await scrape(url)
    const chunks = chunkContent({ content })

    results.push({
      source: {
        title,
        url,
      },
      chunks,
    })

    console.log(`"${title}": ${chunks.length} chunks created`)
  }

  // Write to JSON file
  // fs.writeFileSync("chunks.json", JSON.stringify(results, null, 2));
  // console.log(`Saved results to data_test.json`);

  const outputPath = path.join(__dirname, '..', 'assets', 'chunks.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`Saved results to ${outputPath}`)
}

const urls = [
  'https://www.concordia.ca/jmsb/services/for-students/onboarding.html',
  'https://www.concordia.ca/students/housing.html',
  'https://www.concordia.ca/finearts/academics/advising/new-students-advising-registration.html',
  'https://www.concordia.ca/ginacody/students/new-students/academic-advising.html',
  'https://www.concordia.ca/students/services.html',
  'https://www.concordia.ca/students/international/new-international-students.html',
  'https://www.concordia.ca/admissions/independent-students/accepted-independent.html',
  'https://www.concordia.ca/students/undergraduate.html',
  'https://www.concordia.ca/students/homeroom.html',
  'https://www.concordia.ca/students/undergraduate/welcome.html',
  'https://www.concordia.ca/students/undergraduate/welcome/admitted.html',
  'https://www.concordia.ca/students/undergraduate/welcome/preparing-start.html',
  'https://www.concordia.ca/students/undergraduate/welcome/first-term.html',
  'https://www.concordia.ca/students/new/orientation.html',
  'https://www.concordia.ca/students/new/first-year-counselling.html',
  'https://www.concordia.ca/students/new/mentoring.html',
  'https://www.concordia.ca/students/undergraduate/undergraduate-academic-dates.html',
  'https://www.concordia.ca/students/financial.html',
  'https://www.concordia.ca/students/services/library.html',
  'https://www.concordia.ca/students/services/experiential-learning.html',
  'https://www.concordia.ca/students/services/it-support-software.html',
  'https://www.concordia.ca/students/life/arts-culture-media.html',
  'https://www.concordia.ca/students/life/associations-groups.html',
  'https://www.concordia.ca/students/housing/residences.html',
  'https://www.concordia.ca/students/housing/residences/grey-nuns.html',
  'https://www.concordia.ca/students/housing/residences/loyola-residences.html',
  'https://www.concordia.ca/students/housing/residences/campus1-mtl.html',
  'https://www.concordia.ca/academics/undergraduate/calendar/current/section-71-gina-cody-school-of-engineering-and-computer-science/section-71-20-beng/section-71-20-2-alternative-entry-programs.html',
]

// scrape(url).then(console.log);

urls.forEach((url) => {
  scrape(url).then(console.log)
})

scrapeAndSaveToJson(urls)
