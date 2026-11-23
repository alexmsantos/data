// Experimental classifier: keeps digestpt.json untouched.
// Run: OPENAI_API_KEY=... node scripts/classify-digest-topics.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const INPUT = 'digest/digestpt.json';
const OUTPUT = 'digest/digestpt-topics-experiment.json';
const REPORT = 'digest/topics-experiment-report.json';
const LIMIT = Math.max(1, Math.min(Number(process.env.TOPICS_LIMIT || 100), 500));
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-nano';
const topics = [
  'Governo','Parlamento','Eleições','Partidos políticos','Autarquias',
  'Orçamento do Estado','Impostos','IRS','Pensões','Emprego','Salários',
  'Habitação','Banca','Inflação','Taxas de juro','Empresas','Bolsa',
  'União Europeia','Estados Unidos','Donald Trump','Ucrânia','Rússia',
  'Médio Oriente','Guerra e conflitos','Diplomacia',
  'SNS','Saúde pública','Educação','Ensino superior','Justiça',
  'Segurança','Imigração','Transportes','CP','Ambiente',
  'Alterações climáticas','Incêndios','Energia',
  'Inteligência artificial','Tecnologia','Cibersegurança',
  'Redes sociais','Ciência','Espaço',
  'Futebol','Benfica','Sporting','FC Porto','Seleção nacional',
  'Cinema','Música','Literatura','Televisão','Comunicação social',
  'Turismo','Alimentação'
];

const raw = JSON.parse(await readFile(INPUT, 'utf8'));
if (!Array.isArray(raw) || !raw.every(Array.isArray)) throw new Error('Expected array of media arrays.');
if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY GitHub Actions secret.');
const output = structuredClone(raw);
const candidates = [];
const seen = new Map();
for (const [groupIndex, group] of raw.entries()) {
  for (const [articleIndex, item] of group.entries()) {
    if (typeof item?.title !== 'string' || !item.title.trim()) continue;
    const url = typeof item.url === 'string' ? item.url : '';
    const key = url || item.title.trim();
    if (!seen.has(key) && candidates.length < LIMIT) {
      const id = candidates.length;
      seen.set(key, id);
      candidates.push({ id, title: item.title.replace(/<[^>]+>/g, '').trim() });
    }
  }
}
const classified = new Map();
let usage = { prompt_tokens: 0, completion_tokens: 0 };
for (let start = 0; start < candidates.length; start += 20) {
  const batch = candidates.slice(start, start + 20);
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [
        { role: 'system', content: 'És um classificador de títulos de notícias portuguesas. Usa exclusivamente tópicos da lista autorizada. Atribui entre zero e três tópicos específicos por título, sem especular ou inventar. Evita categorias excessivamente genéricas quando houver tópico preciso. Não infiras factos ausentes. Devolve um item por id, sem omissões.' },
        { role: 'user', content: JSON.stringify({ allowed_topics: topics, articles: batch }) }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'news_topics',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: { results: { type: 'array', items: {
              type: 'object', additionalProperties: false,
              properties: { id: { type: 'integer' }, topics: { type: 'array', items: { type: 'string', enum: topics } } },
              required: ['id','topics']
            } } },
            required: ['results']
          }
        }
      }
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${JSON.stringify(data).slice(0,600)}`);
  const result = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  const expected = new Set(batch.map(x => x.id));
  if (!Array.isArray(result.results) || result.results.length !== batch.length) throw new Error('Invalid number of classifications.');
  for (const entry of result.results) {
    if (!expected.delete(entry.id) || !Array.isArray(entry.topics) || entry.topics.length > 3 || entry.topics.some(t => !topics.includes(t))) {
      throw new Error('Invalid classification returned.');
    }
    classified.set(entry.id, [...new Set(entry.topics)]);
  }
  usage.prompt_tokens += data.usage?.prompt_tokens || 0;
  usage.completion_tokens += data.usage?.completion_tokens || 0;
}
for (const [groupIndex, group] of output.entries()) {
  for (const [articleIndex, item] of group.entries()) {
    const key = typeof item?.url === 'string' && item.url ? item.url : item?.title?.trim();
    if (seen.has(key)) item.topics = classified.get(seen.get(key)) || [];
  }
}
await mkdir('digest', { recursive: true });
await writeFile(OUTPUT, JSON.stringify(output, null, 2) + '\n');
const report = { model: MODEL, processed_unique_titles: classified.size, total_articles: raw.flat().length, output: OUTPUT, token_usage: usage, topic_counts: Object.entries(Object.groupBy([...classified.values()].flat(), t => t)).map(([topic, a]) => ({ topic, count: a.length })).sort((a,b) => b.count-a.count) };
await writeFile(REPORT, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
