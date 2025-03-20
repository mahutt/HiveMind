import axios from 'axios'
import * as cheerio from 'cheerio'

async function scrape(url: string) {
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    return $('body').text().replace(/\s+/g, ' ')
  } catch (error) {
    console.error('Error scraping:', error)
    throw error
  }
}
