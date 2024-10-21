export async function callWikipediaSearch(query: string, limit: string) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'prefixsearch',
    prop: 'pageprops|pageimages|description',
    redirects: '',
    ppprop: 'displaytitle',
    piprop: 'thumbnail',
    pithumbsize: '120',
    pilimit: limit || '6',
    gpssearch: query,
    gpsnamespace: '0',
    gpslimit: limit || '6',
  }).toString();

  const headers = {
    'Cookie': 'GeoIP=CA:ON:Toronto:43.67:-79.43:v4; enwikimwuser-sessionId=b6d87313f1ef7b7a5f8e; WMF-Last-Access=17-Oct-2024; WMF-Last-Access-Global=17-Oct-2024; NetworkProbeLimit=0.001; WMF-DP=01a,b77',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'Referer': 'https://www.wikipedia.org/',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.wikipedia.org',
  };

  try {
    const response = await fetch(url.toString(), { headers });
    const data = await response.json();
    return data
  } catch (error) {
    console.error('Error fetching from Wikipedia API:', error);
    return null
  }
}

export function hashStringToColor(str: string, alpha = 1) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  if (hash < 0) {
    hash = -hash
  }

  // Generate lighter colors by using HSL
  const hue = hash % 360;
  const saturation = 70 + (hash % 30); // 70-100%
  const lightness = 70 + (hash % 20);  // 70-90%

  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

export interface SearchResult {
  index: number
  title: string
  description?: string
  thumbnail?: {
    source: string
    width: number
    height: number
  }
}

export function getSearchResults(data: { query: { pages: { [key: string]: SearchResult } } }, title: string): SearchResult | null {
  const pages = data.query?.pages
  if (pages) {
    const page = Object.values(pages)[0] as SearchResult
    if (page.title === title) {
      if (page.thumbnail?.source) {
        page.thumbnail.source = page.thumbnail.source.replace(/\/\d+px-/, '/480px-')
      }
    }
    return page
  }
  return null
}

export async function getWikiPage(title: string) {
  const data = await callWikipediaSearch(title, '1')
  if (data) {
    return getSearchResults(data, title)
  }
  return null
}

export interface WeightedItem {
  slug: string;
  weight: number;
}

export async function fetchWeightedItems(): Promise<WeightedItem[]> {
  try {
    const response = await fetch('/filtered.txt')
    const text = await response.text()
    return text.trim().split('\n').map(line => {
      const [slug, weight] = line.split(' ')
      return { slug, weight: parseFloat(weight) }
    })
  } catch (error) {
    console.error('Error fetching filtered.txt:', error)
    return []
  }
}
