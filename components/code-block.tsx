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

// Only the languages the page shows are imported, so the rest of Sugar High's
// registry stays out of the bundle.
const languages = {
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
  <div className="border-line bg-canvas-deep overflow-hidden rounded-lg border">
    <div className="border-line text-ink-soft border-b px-4 py-2 font-mono text-xs">
      {label}
    </div>
    <pre className="text-ink overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-relaxed">
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
