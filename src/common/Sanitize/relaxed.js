/* eslint-disable */
module.exports = {
  elements: [
    'a', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col',
    'colgroup', 'dd', 'dl', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'i', 'img', 'li', 'ol', 'p', 'pre', 'q', 'small', 'strike', 'strong',
    'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u',
    'ul'],
  add_attributes: {
      'table': {'width': '100%', 'border': '1', 'style': 'border-collapse:collapse;' },
      'img': { 'width': '600px', 'style': 'text-align:center; display:block;margin:0 auto;', 'align': 'center' },
      'td': { 'style': 'padding:5px;font-size:8pt;' }
  },
  attributes: {
    a: ['href', 'title'],
    blockquote: ['cite'],
    col: ['span', 'width'],
    colgroup: ['span', 'width'],
    img: ['src'],
    ol: ['start', 'type'],
    q: ['cite'],
    table: ['summary', 'width'],
    td: ['abbr', 'axis', 'colspan', 'rowspan', 'width'],
    th: ['abbr', 'axis', 'colspan', 'rowspan', 'scope',
      'width'],
    ul: ['type']
  },

  protocols: {
    a: {
      href: ['ftp', 'http', 'https', 'mailto','__RELATIVE__']
    },
    blockquote: { cite: ['http', 'https', '__RELATIVE__'] },
    // img: { src: ['http', 'https', '__RELATIVE__'] },
    q: { cite: ['http', 'https', '__RELATIVE__'] }
  }
}
/* eslint-enable */
