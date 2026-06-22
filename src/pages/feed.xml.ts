/**
 * /feed.xml — alias for /rss.xml.
 *
 * Many readers and link-pattern conventions probe for `/feed.xml`. Keep
 * the canonical RSS at /rss.xml but serve the same payload here so we
 * don't 404 on the common path.
 */
export { GET } from './rss.xml'
