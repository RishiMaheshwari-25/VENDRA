import { normalize, tokenize } from './searchProducts';

// Wraps matched query words in <mark>. Accent-insensitive; keeps original text intact.
export const makeHighlighter = (query) => {
  const tokens = tokenize(query);
  return (text) => {
    const str = String(text ?? '');
    if (!tokens.length) return str;
    const flat = normalize(str);
    if (flat.length !== str.length) return str; // normalisation changed the length; skip highlighting
    const marks = new Array(str.length).fill(false);
    tokens.forEach((t) => {
      let from = 0;
      for (;;) {
        const at = flat.indexOf(t, from);
        if (at === -1) break;
        for (let i = at; i < at + t.length; i++) marks[i] = true;
        from = at + t.length;
      }
    });
    const out = [];
    let i = 0;
    while (i < str.length) {
      let j = i;
      while (j < str.length && marks[j] === marks[i]) j++;
      const part = str.slice(i, j);
      out.push(marks[i] ? <mark key={i}>{part}</mark> : part);
      i = j;
    }
    return out;
  };
};
