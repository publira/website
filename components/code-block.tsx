import { Highlight } from "@sugar-high/react/core";
import {
  keywords as goKeywords,
  onCommentEnd as goOnCommentEnd,
  onCommentStart as goOnCommentStart,
  typeKeywords as goTypeKeywords,
} from "sugar-high/lang/go";
import {
  keywords as shellKeywords,
  onCommentEnd as shellOnCommentEnd,
  onCommentStart as shellOnCommentStart,
} from "sugar-high/lang/shell";
import { tokenize as typescriptTokenize } from "sugar-high/lang/typescript";

// Sugar High has no Dart. Its comments are C-style, as Go's are.
const dartKeywords = new Set(
  `abstract as assert async await base break case catch class const continue
  covariant default deferred do else enum export extends extension external
  factory false final finally for Function get hide if implements import in
  interface is late library mixin new null of on operator part required
  rethrow return sealed set show static super switch sync this throw true try
  typedef var when while with yield`.split(/\s+/u)
);

const dartTypeKeywords = new Set("bool double dynamic int num void".split(" "));

// The lexer reads neither raw (r'...') nor triple-quoted strings, which would
// otherwise split into an identifier and several strings. Other strings fall
// through to it.
const onDartLiteral = (current: string, index: number, code: string) => {
  const raw = current === "r";
  const start = raw ? index + 1 : index;
  const quote = code[start];

  if (quote !== "'" && quote !== '"') {
    return 0;
  }

  const triple = quote.repeat(3);
  const delimiter = code.startsWith(triple, start) ? triple : quote;

  if (!raw && delimiter === quote) {
    return 0;
  }

  let end = start + delimiter.length;

  while (end < code.length && !code.startsWith(delimiter, end)) {
    end += !raw && code[end] === "\\" ? 2 : 1;
  }

  return Math.min(end + delimiter.length, code.length) - index;
};

// Only the languages the page shows are imported, so the rest of Sugar High's
// registry stays out of the bundle.
const languages = {
  dart: {
    keywords: dartKeywords,
    onCommentEnd: goOnCommentEnd,
    onCommentStart: goOnCommentStart,
    onLiteral: onDartLiteral,
    typeKeywords: dartTypeKeywords,
  },
  go: {
    keywords: goKeywords,
    onCommentEnd: goOnCommentEnd,
    onCommentStart: goOnCommentStart,
    typeKeywords: goTypeKeywords,
  },
  shell: {
    keywords: shellKeywords,
    onCommentEnd: shellOnCommentEnd,
    onCommentStart: shellOnCommentStart,
  },
  typescript: { tokenize: typescriptTokenize },
};

export interface CodeBlockProps {
  readonly code: string;
  readonly label: string;
  readonly lang: keyof typeof languages;
}

export const CodeBlock = ({ code, label, lang }: CodeBlockProps) => (
  <div className="border-border bg-muted overflow-hidden rounded-lg border">
    <div className="border-border text-muted-foreground border-b px-4 py-2 font-mono text-xs">
      {label}
    </div>
    <pre className="text-foreground overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-relaxed">
      <Highlight
        code={code}
        lang={languages[lang]}
        render={({ lines }) => (
          <code>
            {lines.map((line, lineIndex) => (
              // Lines are plain inline spans joined by newlines, so blank lines
              // keep their height inside <pre> and copied text keeps its breaks.
              <span className={line.properties.className} key={lineIndex}>
                {lineIndex > 0 && "\n"}
                {line.tokens.map((token, tokenIndex) => (
                  <span
                    className={token.properties.className}
                    key={tokenIndex}
                    style={{ color: `var(--sh-${token.tokenType})` }}
                  >
                    {token.value}
                  </span>
                ))}
              </span>
            ))}
          </code>
        )}
      />
    </pre>
  </div>
);
